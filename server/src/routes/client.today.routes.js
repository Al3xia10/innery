import { Router } from "express";
import { Op, fn, col, literal } from "sequelize";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// prompt simplu (hardcodat pentru MVP)
const PROMPTS = [
  { id: 1, text: "Ce ai nevoie azi, chiar acum?" },
  { id: 2, text: "Ce ți-a făcut bine azi, chiar și puțin?" },
  { id: 3, text: "Ce ai vrea să spui cuiva apropiat, dar nu ai spus?" },
  { id: 4, text: "Care e un lucru mic pe care îl poți face pentru tine azi?" },
  { id: 5, text: "Dacă ai vorbi cu blândețe cu tine, ce ai spune?" },
];

function pickDailyPrompt(date = new Date()) {
  const day = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return PROMPTS[day % PROMPTS.length];
}

function getClientUserId(req) {
  const n = Number(req.user?.sub ?? req.user?.id);
  return !n || Number.isNaN(n) ? null : n;
}

function isoDayUTC(d) {
  return new Date(d).toISOString().slice(0, 10);
}

function clampInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}

function clampFloat(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  if (n < min || n > max) return null;
  return n;
}

function round1(n) {
  if (n == null) return null;
  const x = Number(n);
  if (!Number.isFinite(x)) return null;
  return Math.round(x * 10) / 10;
}

function computeTrendLabel(firstAvg, secondAvg) {
  if (firstAvg == null || secondAvg == null) return null;
  const diff = secondAvg - firstAvg;
  // keep it gentle; tiny diffs are noise
  if (Math.abs(diff) < 0.25) {
    return {
      label: "stabil",
      hint: "Pare relativ constant în fereastra asta.",
    };
  }
  if (diff >= 1) {
    return {
      label: "în creștere",
      hint: "În ultimele zile pare mai bine decât la început.",
    };
  }
  if (diff >= 0.25) {
    return {
      label: "ușor în creștere",
      hint: "Ușor mai bine în a doua parte a perioadei.",
    };
  }
  if (diff <= -1) {
    return {
      label: "în scădere",
      hint: "În ultimele zile pare mai dificil decât la început.",
    };
  }
  return {
    label: "ușor în scădere",
    hint: "Ușor mai dificil în a doua parte a perioadei.",
  };
}

function computeProgressSummary(series) {
  // best/toughest by mood among days that actually have data (count > 0 and mood not null)
  let best = null;
  let tough = null;

  const missingDays = [];
  const moodValues = [];

  for (const s of series) {
    if (!s || !s.day) continue;

    const hasData = Number(s.count ?? 0) > 0;
    const mood = s.mood == null ? null : Number(s.mood);

    if (!hasData) {
      missingDays.push(String(s.day));
      continue;
    }

    if (mood != null && Number.isFinite(mood)) {
      moodValues.push(mood);

      if (!best || mood > best.mood)
        best = { day: String(s.day), mood: round1(mood) };
      if (!tough || mood < tough.mood)
        tough = { day: String(s.day), mood: round1(mood) };
    }
  }

  // Trend: compare first half vs second half of mood values (ordered by day already)
  const moodOrdered = series
    .filter((s) => Number(s?.count ?? 0) > 0 && s?.mood != null)
    .map((s) => Number(s.mood))
    .filter((n) => Number.isFinite(n));

  let trend = null;
  if (moodOrdered.length >= 3) {
    const mid = Math.floor(moodOrdered.length / 2);
    const first = moodOrdered.slice(0, mid);
    const second = moodOrdered.slice(mid);
    const avg = (arr) =>
      arr.length ? arr.reduce((sum, x) => sum + x, 0) / arr.length : null;
    const t = computeTrendLabel(avg(first), avg(second));
    if (t) trend = t;
  }

  return {
    bestDay: best,
    toughestDay: tough,
    missingDays,
    trend,
  };
}

async function getActiveLinkForClient(clientUserId) {
  return models.Client.findOne({
    where: { userId: clientUserId, status: "Active" },
    order: [["updated_at", "DESC"]],
  });
}

// GET /api/client/today
router.get(
  "/client/today",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    // therapistId (dacă e linked)
    const link = await getActiveLinkForClient(clientUserId);
    const therapistId = link?.therapistId ?? null;

    // next session
    const now = new Date();
    const nextSession = await models.Session.findOne({
      where: {
        clientUserId,
        status: "Scheduled",
        startsAt: { [Op.gte]: now },
      },
      include: [
        {
          model: models.User,
          as: "therapist",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["startsAt", "ASC"]],
    });

    // last checkin
    const lastCheckin = await models.Checkin.findOne({
      where: { clientUserId },
      order: [
        ["day", "DESC"],
        ["updated_at", "DESC"],
        ["created_at", "DESC"],
      ],
    });

    // exists today? (simplu: comparăm date string UTC)
    const todayStr = isoDayUTC(new Date());
    const lastStr = lastCheckin?.day
      ? String(lastCheckin.day)
      : lastCheckin?.createdAt
        ? isoDayUTC(lastCheckin.createdAt)
        : null;
    const existsToday = lastStr === todayStr;

    // streak (daily checkins consecutive days)
    const recent = await models.Checkin.findAll({
      where: { clientUserId, type: "daily" },
      attributes: ["day", "createdAt"],
      order: [
        ["day", "DESC"],
        ["updated_at", "DESC"],
        ["created_at", "DESC"],
      ],
      limit: 90,
    });

    const daySet = new Set();
    for (const r of recent) {
      const d = r?.day
        ? String(r.day)
        : r?.createdAt
          ? isoDayUTC(r.createdAt)
          : null;
      if (d) daySet.add(d);
    }

    let streak = 0;
    let cursor = todayStr;
    while (daySet.has(cursor)) {
      streak += 1;
      const dt = new Date(cursor + "T00:00:00.000Z");
      dt.setUTCDate(dt.getUTCDate() - 1);
      cursor = isoDayUTC(dt);
    }

    // active goal + last update
    const activeGoal = await models.Goal.findOne({
      where: { clientUserId, status: "active" },
      order: [["updated_at", "DESC"]],
    });

    let lastGoalUpdate = null;
    if (activeGoal) {
      lastGoalUpdate = await models.GoalUpdate.findOne({
        where: { goalId: activeGoal.id },
        order: [["created_at", "DESC"]],
      });
    }

    return res.json({
      today: {
        date: todayStr,
        prompt: pickDailyPrompt(new Date()),
        therapistId,
        checkin: {
          existsToday,
          last: lastCheckin,
          streak: { count: streak },
        },
        nextSession,
        activeGoal: activeGoal
          ? { ...activeGoal.toJSON(), lastUpdate: lastGoalUpdate }
          : null,
      },
    });
  },
);

// GET /api/client/progress?range=7|30
router.get(
  "/client/progress",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const rangeRaw = String(req.query?.range ?? "7");
    const days = rangeRaw === "30" ? 30 : 7;

    // We return last N days (including today) as day buckets in UTC.
    const end = new Date();
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);
    const startDay = isoDayUTC(start);
    const endDay = isoDayUTC(end);

    const rows = await models.Checkin.findAll({
      where: {
        clientUserId,
        type: "daily",
        day: { [Op.gte]: startDay, [Op.lte]: endDay },
      },
      attributes: [
        [col("day"), "day"],
        [fn("AVG", col("mood")), "mood"],
        [fn("AVG", col("anxiety")), "anxiety"],
        [fn("AVG", col("energy")), "energy"],
        [fn("AVG", col("sleep_hours")), "sleepHours"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [col("day")],
      order: [[col("day"), "ASC"]],
      raw: true,
    });

    const byDay = new Map();
    for (const r of rows) {
      const day = String(r.day);
      const toNum = (x) => (x == null ? null : Number(x));
      byDay.set(day, {
        day,
        mood: toNum(r.mood),
        anxiety: toNum(r.anxiety),
        energy: toNum(r.energy),
        sleepHours: toNum(r.sleepHours),
        count: Number(r.count ?? 0),
      });
    }

    const series = [];
    const cursor = new Date(start);
    for (let i = 0; i < days; i++) {
      const day = isoDayUTC(cursor);
      series.push(
        byDay.get(day) ?? {
          day,
          mood: null,
          anxiety: null,
          energy: null,
          sleepHours: null,
          count: 0,
        },
      );
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }

    // Simple insights (non-AI): sleep<6 correlation + after-session lift (best-effort)
    const all = await models.Checkin.findAll({
      where: {
        clientUserId,
        type: "daily",
        day: { [Op.gte]: startDay, [Op.lte]: endDay },
      },
      attributes: ["mood", "anxiety", "sleepHours", "day", "createdAt"],
      order: [["day", "ASC"]],
    });

    const sleepLow = [];
    const sleepOk = [];
    for (const c of all) {
      const sh = c.sleepHours == null ? null : Number(c.sleepHours);
      const anx = c.anxiety == null ? null : Number(c.anxiety);
      if (sh == null || anx == null) continue;
      if (sh < 6) sleepLow.push(anx);
      else sleepOk.push(anx);
    }

    const avg = (arr) => {
      if (!arr.length) return null;
      return arr.reduce((s, x) => s + x, 0) / arr.length;
    };

    const insights = [];
    const aLow = avg(sleepLow);
    const aOk = avg(sleepOk);
    if (
      aLow != null &&
      aOk != null &&
      sleepLow.length >= 2 &&
      sleepOk.length >= 2
    ) {
      const diff = aLow - aOk;
      if (Math.abs(diff) >= 0.5) {
        insights.push({
          id: "sleep_anxiety",
          text:
            diff > 0
              ? `În zilele cu somn sub 6h, anxietatea pare mai mare (≈ +${diff.toFixed(1)}).`
              : `În zilele cu somn sub 6h, anxietatea pare mai mică (≈ ${diff.toFixed(1)}).`,
        });
      }
    }

    const summary = computeProgressSummary(series);

    return res.json({
      progress: {
        rangeDays: days,
        series,
        insights,
        summary,
      },
    });
  },
);

// POST /api/client/checkins
// Regula produs: 1 check-in / zi / tip.
// Dacă există deja un check-in pentru (client_user_id, type, day), îl actualizăm (upsert).
router.post(
  "/client/checkins",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const {
      type = "daily",
      mood,
      anxiety,
      energy,
      sleepHours,
      note,
      sessionId,
    } = req.body || {};

    const moodI = clampInt(mood, 1, 10);
    const anxietyI = anxiety == null ? null : clampInt(anxiety, 1, 10);
    const energyI = energy == null ? null : clampInt(energy, 1, 10);
    const sleepF = sleepHours == null ? null : clampFloat(sleepHours, 0, 24);

    if (moodI == null) {
      return res
        .status(400)
        .json({ message: "mood trebuie să fie între 1 și 10" });
    }
    if (anxiety != null && anxietyI == null) {
      return res
        .status(400)
        .json({ message: "anxiety trebuie să fie între 1 și 10" });
    }
    if (energy != null && energyI == null) {
      return res
        .status(400)
        .json({ message: "energy trebuie să fie între 1 și 10" });
    }
    if (sleepHours != null && sleepF == null) {
      return res
        .status(400)
        .json({ message: "sleepHours trebuie să fie între 0 și 24" });
    }

    const allowedTypes = new Set(["daily", "pre_session", "post_session"]);
    const typeSafe = allowedTypes.has(type) ? type : "daily";

    // IMPORTANT: folosim "day" ca să garantăm 1 check-in/zi.
    // Luăm ziua în UTC, ca să fie consistentă cu restul endpointurilor (progress/today).
    const day = isoDayUTC(new Date());

    // therapistId (optional)
    const link = await getActiveLinkForClient(clientUserId);
    const therapistId = link?.therapistId ?? null;

    // Upsert: dacă există deja azi pentru tipul ăsta, îl actualizăm.
    const existing = await models.Checkin.findOne({
      where: { clientUserId, type: typeSafe, day },
      order: [["created_at", "DESC"]],
    });

    if (existing) {
      await existing.update({
        therapistId,
        sessionId: sessionId ?? existing.sessionId ?? null,
        mood: moodI,
        anxiety: anxietyI,
        energy: energyI,
        sleepHours: sleepF,
        note: note ?? null,
      });

      return res.status(200).json({ checkin: existing, updated: true });
    }

    try {
      const created = await models.Checkin.create({
        clientUserId,
        therapistId,
        sessionId: sessionId ?? null,
        type: typeSafe,
        day,
        mood: moodI,
        anxiety: anxietyI,
        energy: energyI,
        sleepHours: sleepF,
        note: note ?? null,
      });

      return res.status(201).json({ checkin: created, updated: false });
    } catch (err) {
      // În caz de race condition (2 request-uri simultan), indexul unic poate da duplicate.
      // Atunci re-citim și facem update.
      const msg = String(err?.original?.code || err?.parent?.code || "");
      if (msg === "ER_DUP_ENTRY") {
        const again = await models.Checkin.findOne({
          where: { clientUserId, type: typeSafe, day },
        });
        if (again) {
          await again.update({
            therapistId,
            sessionId: sessionId ?? again.sessionId ?? null,
            mood: moodI,
            anxiety: anxietyI,
            energy: energyI,
            sleepHours: sleepF,
            note: note ?? null,
          });
          return res.status(200).json({ checkin: again, updated: true });
        }
      }

      throw err;
    }
  },
);

// GET /api/client/plan
router.get(
  "/client/plan",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const goal = await models.Goal.findOne({
      where: { clientUserId, status: "active" },
      order: [["updated_at", "DESC"]],
      include: [
        {
          model: models.GoalUpdate,
          as: "updates",
          separate: true,
          limit: 10,
          order: [["created_at", "DESC"]],
        },
      ],
    });

    return res.json({ plan: { activeGoal: goal ? goal.toJSON() : null } });
  },
);

// POST /api/client/goals  { title }
router.post(
  "/client/goals",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const title = String(req.body?.title ?? "").trim();
    if (!title || title.length < 3) {
      return res
        .status(400)
        .json({ message: "title este obligatoriu (minim 3 caractere)" });
    }

    const link = await getActiveLinkForClient(clientUserId);

    // Optionally pause any existing active goal
    await models.Goal.update(
      { status: "paused" },
      { where: { clientUserId, status: "active" } },
    );

    const created = await models.Goal.create({
      clientUserId,
      therapistId: link?.therapistId ?? null,
      title,
      status: "active",
    });

    return res.status(201).json({ goal: created });
  },
);

// POST /api/client/goals/:goalId/updates  { rating?, note? }
router.post(
  "/client/goals/:goalId/updates",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const goalId = Number(req.params.goalId);
    if (!goalId || Number.isNaN(goalId)) {
      return res.status(400).json({ message: "goalId invalid" });
    }

    const goal = await models.Goal.findOne({
      where: { id: goalId, clientUserId },
    });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const rating =
      req.body?.rating == null ? null : clampInt(req.body.rating, 1, 10);
    if (req.body?.rating != null && rating == null) {
      return res
        .status(400)
        .json({ message: "rating trebuie să fie între 1 și 10" });
    }

    const note =
      req.body?.note == null ? null : String(req.body.note).slice(0, 800);

    const created = await models.GoalUpdate.create({
      goalId: goal.id,
      rating,
      note,
      createdAt: new Date(),
    });

    return res.status(201).json({ update: created });
  },
);

export default router;
