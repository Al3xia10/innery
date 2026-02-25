import { Router } from "express";
import { Sequelize } from "sequelize";
import { models } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

/**
 * IMPORTANT:
 * - presupun că middleware-ul tău expune `requireAuth`
 * - și că `req.user` conține `{ id, role, ... }`
 * Dacă la tine se numește altfel (ex: authRequired), spune-mi și îl ajustăm.
 */

router.use(requireAuth);

// Time helpers (Europe/Bucharest)
function toBucharestDayString(d = new Date()) {
  // returns YYYY-MM-DD in Europe/Bucharest
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Bucharest",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${day}`;
}

function addDaysToISODate(isoDate, deltaDays) {
  // isoDate: YYYY-MM-DD
  const dt = new Date(`${isoDate}T00:00:00.000Z`);
  dt.setUTCDate(dt.getUTCDate() + deltaDays);
  return dt.toISOString().slice(0, 10);
}

// Helpers
function intParam(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function normalizeType(t) {
  if (t === "daily" || t === "pre_session" || t === "post_session") return t;
  return "daily";
}

// GET /api/client/checkins?range=7
router.get("/checkins", async (req, res, next) => {
  try {
    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.set("Cache-Control", "no-store");

    const range = clamp(intParam(req.query.range, 7), 1, 365);

    // Use Bucharest day window (inclusive)
    const today = toBucharestDayString(new Date());
    const startDay = addDaysToISODate(today, -(range - 1));

    const rows = await models.Checkin.findAll({
      where: {
        clientUserId: req.user.id,
        // relies on your DB column `day` (DATE) + model mapping
        day: { [Sequelize.Op.gte]: startDay },
      },
      order: [
        ["day", "DESC"],
        ["createdAt", "DESC"],
      ],
      limit: 500,
    });

    // If older duplicates exist (before unique index), keep only the newest per day.
    const seen = new Set();
    const deduped = [];
    for (const r of rows) {
      const k = `${r.type || "daily"}::${r.day || ""}`;
      if (seen.has(k)) continue;
      seen.add(k);
      deduped.push(r);
    }

    return res.json({ checkins: deduped });
  } catch (err) {
    next(err);
  }
});

// POST /api/client/checkins
router.post("/checkins", async (req, res, next) => {
  try {
    if (req.user?.role !== "client") {
      return res.status(403).json({ message: "Forbidden" });
    }

    res.set("Cache-Control", "no-store");

    const body = req.body ?? {};

    const type = normalizeType(body.type);
    const moodRaw = Number(body.mood);

    if (!Number.isFinite(moodRaw)) {
      return res.status(400).json({ message: "mood este obligatoriu (număr)" });
    }

    // mood e 1..10 (tu poți schimba dacă vrei)
    const mood = clamp(moodRaw, 0, 10);

    const anxiety =
      body.anxiety == null ? null : clamp(Number(body.anxiety), 0, 10);
    const energy =
      body.energy == null ? null : clamp(Number(body.energy), 0, 10);

    const sleepHours =
      body.sleepHours == null || body.sleepHours === ""
        ? null
        : Math.max(0, Number(body.sleepHours));

    const note =
      typeof body.note === "string" ? body.note.trim().slice(0, 800) : null;

    // therapistId: îl deducem din tabela clients (dacă există legătura)
    const link = await models.Client.findOne({
      where: { userId: req.user.id },
      attributes: ["therapistId"],
    });

    const therapistId = link?.therapistId ?? null;

    // sessionId: optional (poți trimite din frontend dacă e pre/post session)
    const sessionId =
      body.sessionId == null || body.sessionId === ""
        ? null
        : Number(body.sessionId);

    // Compute Bucharest day once; required for daily upsert
    const day = toBucharestDayString(new Date());

    // For DAILY we enforce 1 check-in per day (create-or-update)
    if (type === "daily") {
      const existing = await models.Checkin.findOne({
        where: {
          clientUserId: req.user.id,
          type: "daily",
          day,
        },
        order: [["createdAt", "DESC"]],
      });

      if (existing) {
        await existing.update({
          therapistId,
          sessionId,
          mood,
          anxiety: Number.isFinite(anxiety) ? anxiety : null,
          energy: Number.isFinite(energy) ? energy : null,
          sleepHours: Number.isFinite(sleepHours) ? sleepHours : null,
          note,
          // keep day as-is
        });

        return res.status(200).json({
          mode: "updated",
          checkin: existing,
        });
      }

      try {
        const created = await models.Checkin.create({
          clientUserId: req.user.id,
          therapistId,
          sessionId,
          type,
          day,
          mood,
          anxiety: Number.isFinite(anxiety) ? anxiety : null,
          energy: Number.isFinite(energy) ? energy : null,
          sleepHours: Number.isFinite(sleepHours) ? sleepHours : null,
          note,
        });

        return res.status(201).json({ mode: "created", checkin: created });
      } catch (e) {
        // If the unique index triggers (race), update instead
        // MySQL duplicate key => ER_DUP_ENTRY (code: 'ER_DUP_ENTRY', errno: 1062)
        if (e?.original?.errno === 1062 || e?.parent?.errno === 1062) {
          const again = await models.Checkin.findOne({
            where: { clientUserId: req.user.id, type: "daily", day },
            order: [["createdAt", "DESC"]],
          });
          if (again) {
            await again.update({
              therapistId,
              sessionId,
              mood,
              anxiety: Number.isFinite(anxiety) ? anxiety : null,
              energy: Number.isFinite(energy) ? energy : null,
              sleepHours: Number.isFinite(sleepHours) ? sleepHours : null,
              note,
            });
            return res.status(200).json({ mode: "updated", checkin: again });
          }
        }
        throw e;
      }
    }

    // Non-daily types can have multiple entries
    const created = await models.Checkin.create({
      clientUserId: req.user.id,
      therapistId,
      sessionId,
      type,
      day,
      mood,
      anxiety: Number.isFinite(anxiety) ? anxiety : null,
      energy: Number.isFinite(energy) ? energy : null,
      sleepHours: Number.isFinite(sleepHours) ? sleepHours : null,
      note,
    });

    return res.status(201).json({ checkin: created });
  } catch (err) {
    next(err);
  }
});

export default router;
