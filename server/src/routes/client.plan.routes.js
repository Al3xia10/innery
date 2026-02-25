import { Router } from "express";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function getClientUserId(req) {
  const n = Number(req.user?.sub ?? req.user?.id);
  return !n || Number.isNaN(n) ? null : n;
}

function clampInt(v, min, max) {
  const n = Number(v);
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}

async function getActiveLinkForClient(clientUserId) {
  return models.Client.findOne({
    where: { userId: clientUserId, status: "Active" },
    order: [[models.Client.sequelize.col("updated_at"), "DESC"]],
  });
}

// GET /api/client/plan
// Returns all goals (active, paused, done) + last updates
router.get("/", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const goals = await models.Goal.findAll({
    where: { clientUserId },
    include: [
      {
        model: models.GoalUpdate,
        as: "updates",
        separate: true,
        limit: 1,
        order: [[models.GoalUpdate.sequelize.col("created_at"), "DESC"]],
      },
    ],
    order: [[models.Goal.sequelize.col("updated_at"), "DESC"]],
  });

  const shapedGoals = goals.map((g) => {
    const lastUpdate = g.updates?.[0] ?? null;
    const json = g.toJSON();
    // Nu trimitem `updates` ca array (era doar pentru include intern).
    // Frontend-ul folosește `lastUpdate`.
    delete json.updates;
    return {
      ...json,
      lastUpdate,
    };
  });

  const activeGoal = shapedGoals.find((g) => g.status === "active") ?? null;

  return res.json({
    // compat cu UI-ul care încă se uită la `plan.activeGoal`
    plan: {
      activeGoal,
      goals: shapedGoals,
      exercises: [],
      resources: [],
    },

    // compat înapoi (dacă ai deja frontend care citește direct `goals`)
    goals: shapedGoals,
    exercises: [],
    resources: [],
  });
});

// GET /api/client/plan/goals
router.get("/goals", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const goals = await models.Goal.findAll({
    where: { clientUserId },
    include: [
      {
        model: models.GoalUpdate,
        as: "updates",
        separate: true,
        limit: 1,
        order: [[models.GoalUpdate.sequelize.col("created_at"), "DESC"]],
      },
    ],
    order: [[models.Goal.sequelize.col("updated_at"), "DESC"]],
  });

  const shapedGoals = goals.map((g) => {
    const lastUpdate = g.updates?.[0] ?? null;
    const json = g.toJSON();
    delete json.updates;
    return {
      ...json,
      lastUpdate,
    };
  });

  return res.json({ goals: shapedGoals });
});

// POST /api/client/plan/goals
router.post("/goals", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const { title } = req.body || {};

  if (!title || !String(title).trim()) {
    return res
      .status(400)
      .json({ message: "Titlul obiectivului este obligatoriu" });
  }

  const link = await getActiveLinkForClient(clientUserId);

  const created = await models.Goal.create({
    clientUserId,
    therapistId: link?.therapistId ?? null,
    title: String(title).trim(),
    status: "active",
  });

  return res.status(201).json({ goal: created });
});

// PUT/PATCH /api/client/plan/goals/:id
// UI-ul folosește PUT, iar uneori patch e mai convenabil — suportăm ambele.
async function updateGoalHandler(req, res) {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalid" });
  }

  const goal = await models.Goal.findOne({ where: { id, clientUserId } });

  if (!goal)
    return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

  const { title, status } = req.body || {};

  const patch = {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      return res.status(400).json({ message: "Titlul nu poate fi gol" });
    }
    patch.title = String(title).trim();
  }

  if (status !== undefined) {
    const allowed = ["active", "paused", "done"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Status invalid" });
    }
    patch.status = status;
  }

  // dacă nu vine nimic de actualizat, nu facem update inutil
  if (Object.keys(patch).length === 0) {
    return res.json({ goal });
  }

  await goal.update(patch);

  return res.json({ goal });
}

router.put("/goals/:id", requireAuth, requireRole("client"), updateGoalHandler);

router.patch(
  "/goals/:id",
  requireAuth,
  requireRole("client"),
  updateGoalHandler,
);

// POST /api/client/plan/goals/:id/updates
router.post(
  "/goals/:id/updates",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    const goal = await models.Goal.findOne({ where: { id, clientUserId } });

    if (!goal)
      return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

    const { rating, note } = req.body || {};

    const ratingI = rating == null ? null : clampInt(rating, 1, 10);
    if (rating != null && ratingI == null) {
      return res
        .status(400)
        .json({ message: "Rating trebuie să fie între 1 și 10" });
    }

    const created = await models.GoalUpdate.create({
      goalId: goal.id,
      rating: ratingI,
      note: note ?? null,
      createdAt: new Date(),
    });

    return res.status(201).json({ update: created });
  },
);

// PATCH /api/client/plan/goals/:id/updates/:updateId
// Edit an existing progress update (rating/note)
router.patch(
  "/goals/:id/updates/:updateId",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const goalId = Number(req.params.id);
    const updateId = Number(req.params.updateId);

    const goal = await models.Goal.findOne({
      where: { id: goalId, clientUserId },
    });
    if (!goal)
      return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

    const update = await models.GoalUpdate.findOne({
      where: { id: updateId, goalId: goal.id },
    });

    if (!update)
      return res
        .status(404)
        .json({ message: "Progresul (update) nu a fost găsit" });

    const { rating, note } = req.body || {};

    const patch = {};

    if (rating !== undefined) {
      const ratingI = rating == null ? null : clampInt(rating, 1, 10);
      if (rating != null && ratingI == null) {
        return res
          .status(400)
          .json({ message: "Rating trebuie să fie între 1 și 10" });
      }
      patch.rating = ratingI;
    }

    if (note !== undefined) {
      const s = note == null ? null : String(note);
      patch.note = s;
    }

    await update.update(patch);

    return res.json({ update });
  },
);

// DELETE /api/client/plan/goals/:id/updates/:updateId
router.delete(
  "/goals/:id/updates/:updateId",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const goalId = Number(req.params.id);
    const updateId = Number(req.params.updateId);

    const goal = await models.Goal.findOne({
      where: { id: goalId, clientUserId },
    });
    if (!goal)
      return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

    const update = await models.GoalUpdate.findOne({
      where: { id: updateId, goalId: goal.id },
    });

    if (!update)
      return res
        .status(404)
        .json({ message: "Progresul (update) nu a fost găsit" });

    await update.destroy();

    return res.json({ ok: true });
  },
);

// DELETE /api/client/plan/goals/:id
// Trash button for a goal (deletes goal; updates should cascade)
router.delete(
  "/goals/:id",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const id = Number(req.params.id);
    const goal = await models.Goal.findOne({ where: { id, clientUserId } });

    if (!goal)
      return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

    await goal.destroy();

    return res.json({ ok: true });
  },
);

export default router;
