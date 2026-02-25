import { Router } from "express";
import { Op, fn, col, literal } from "sequelize";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

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

async function getActiveLinkForClient(clientUserId) {
  return models.Client.findOne({
    where: { userId: clientUserId, status: "Active" },
    order: [["updatedAt", "DESC"]],
  });
}

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

    // Return last N days (including today) as day buckets in UTC.
    const end = new Date();
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - (days - 1));
    start.setUTCHours(0, 0, 0, 0);

    const rows = await models.Checkin.findAll({
      where: {
        clientUserId,
        type: "daily",
        createdAt: { [Op.gte]: start, [Op.lte]: end },
      },
      attributes: [
        [fn("DATE", col("created_at")), "day"],
        [fn("AVG", col("mood")), "mood"],
        [fn("AVG", col("anxiety")), "anxiety"],
        [fn("AVG", col("energy")), "energy"],
        [fn("AVG", col("sleep_hours")), "sleepHours"],
        [fn("COUNT", col("id")), "count"],
      ],
      group: [literal("day")],
      order: [[literal("day"), "ASC"]],
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

    // Simple insights (non-AI): sleep<6 correlation
    const all = await models.Checkin.findAll({
      where: {
        clientUserId,
        type: "daily",
        createdAt: { [Op.gte]: start, [Op.lte]: end },
      },
      attributes: ["mood", "anxiety", "sleepHours", "createdAt"],
      order: [["createdAt", "ASC"]],
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

    return res.json({ progress: { rangeDays: days, series, insights } });
  },
);

// POST /api/client/checkins
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

    // therapistId (optional) if client is linked
    const link = await getActiveLinkForClient(clientUserId);

    const created = await models.Checkin.create({
      clientUserId,
      therapistId: link?.therapistId ?? null,
      sessionId: sessionId ?? null,
      type: typeSafe,
      mood: moodI,
      anxiety: anxietyI,
      energy: energyI,
      sleepHours: sleepF,
      note: note ?? null,
    });

    return res.status(201).json({ checkin: created });
  },
);

export default router;
