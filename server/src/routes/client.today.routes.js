import { Router } from "express";
import { Op } from "sequelize";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// prompt simplu (hardcodat pentru MVP)
const PROMPTS = [
  { id: 1, text: "Ce ai nevoie azi?" },
  { id: 2, text: "Ce ți-a făcut bine azi, chiar și puțin?" },
  { id: 3, text: "Ce ai vrea să spui cuiva apropiat, dar nu ai spus?" },
];

function pickDailyPrompt(date = new Date()) {
  const day = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
  return PROMPTS[day % PROMPTS.length];
}

// GET /api/client/today
router.get(
  "/client/today",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = req.user.id;

    // therapistId (dacă e linked)
    const link = await models.Client.findOne({
      where: { userId: clientUserId, status: "Active" },
      order: [["updated_at", "DESC"]],
    });

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
      order: [["created_at", "DESC"]],
    });

    // exists today? (simplu: comparăm date string UTC)
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastStr = lastCheckin?.createdAt?.toISOString?.().slice(0, 10);
    const existsToday = lastStr === todayStr;

    // streak (daily checkins consecutive days)
    const recent = await models.Checkin.findAll({
      where: { clientUserId, type: "daily" },
      attributes: ["createdAt"],
      order: [["created_at", "DESC"]],
      limit: 60,
    });

    const uniqueDays = [];
    for (const r of recent) {
      const d = r.createdAt.toISOString().slice(0, 10);
      if (!uniqueDays.includes(d)) uniqueDays.push(d);
    }

    let streak = 0;
    let cursor = todayStr;
    while (uniqueDays.includes(cursor)) {
      streak += 1;
      const dt = new Date(cursor + "T00:00:00.000Z");
      dt.setUTCDate(dt.getUTCDate() - 1);
      cursor = dt.toISOString().slice(0, 10);
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

// POST /api/client/checkins
router.post(
  "/client/checkins",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = req.user.id;

    const {
      type = "daily",
      mood,
      anxiety,
      energy,
      sleepHours,
      note,
      sessionId,
    } = req.body || {};

    if (!mood || mood < 1 || mood > 10) {
      return res.status(400).json({ message: "mood must be between 1 and 10" });
    }

    // therapistId (optional)
    const link = await models.Client.findOne({
      where: { userId: clientUserId, status: "Active" },
      order: [["updated_at", "DESC"]],
    });

    const created = await models.Checkin.create({
      clientUserId,
      therapistId: link?.therapistId ?? null,
      sessionId: sessionId ?? null,
      type,
      mood,
      anxiety: anxiety ?? null,
      energy: energy ?? null,
      sleepHours: sleepHours ?? null,
      note: note ?? null,
    });

    return res.status(201).json({ checkin: created });
  },
);

export default router;
