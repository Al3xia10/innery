import { Router } from "express";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { generateGoalStepsWithAi } from "../controller/goalStepsAi.js";

const router = Router();

let goalStepsTableAvailableCache = null;
let goalStepsTableCacheTs = 0;
let goalStepsColumnsCache = null;
let goalStepsColumnsCacheTs = 0;

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

async function hasGoalStepsTable() {
  const now = Date.now();
  const cacheAgeMs = now - goalStepsTableCacheTs;
  // Keep positive cache longer; retry false cache quickly so app recovers after migrations.
  if (goalStepsTableAvailableCache === true && cacheAgeMs < 5 * 60 * 1000) return true;
  if (goalStepsTableAvailableCache === false && cacheAgeMs < 15 * 1000) return false;
  try {
    const exists = await models.Goal.sequelize
      .getQueryInterface()
      .tableExists("goal_steps");
    goalStepsTableAvailableCache = Boolean(exists);
    goalStepsTableCacheTs = now;
    return goalStepsTableAvailableCache;
  } catch {
    goalStepsTableAvailableCache = false;
    goalStepsTableCacheTs = now;
    return false;
  }
}

async function getGoalStepsColumns() {
  const now = Date.now();
  const cacheAgeMs = now - goalStepsColumnsCacheTs;
  if (goalStepsColumnsCache && cacheAgeMs < 30 * 1000) return goalStepsColumnsCache;

  try {
    const table = await models.Goal.sequelize.getQueryInterface().describeTable("goal_steps");
    goalStepsColumnsCache = new Set(Object.keys(table || {}));
    goalStepsColumnsCacheTs = now;
    return goalStepsColumnsCache;
  } catch {
    goalStepsColumnsCache = null;
    goalStepsColumnsCacheTs = now;
    return null;
  }
}

async function buildGoalStepsInclude() {
  const hasTable = await hasGoalStepsTable();
  if (!hasTable) return null;

  const cols = await getGoalStepsColumns();
  if (!cols) return null;

  const attrs = ["id", "title"];
  if (cols.has("done")) attrs.push("done");
  if (cols.has("order_index")) attrs.push("orderIndex");
  if (cols.has("created_at")) attrs.push("createdAt");
  if (cols.has("updated_at")) attrs.push("updatedAt");

  return {
    model: models.GoalStep,
    as: "steps",
    required: false,
    attributes: attrs,
  };
}

function computeProgressFromSteps(steps) {
  const total = Array.isArray(steps) ? steps.length : 0;
  if (!total) return 0;
  const done = steps.filter((s) => Boolean(s?.done)).length;
  return Math.round((done / total) * 100);
}

function shapeGoalWithProgress(g) {
  const json = g.toJSON();
  const steps = Array.isArray(json.steps) ? json.steps : [];
  const progress = computeProgressFromSteps(steps);
  return {
    ...json,
    progress,
    stepsTotal: steps.length,
    stepsDone: steps.filter((s) => Boolean(s?.done)).length,
  };
}

// GET /api/client/plan
// Returns all goals (active, paused, done) + last updates
router.get("/", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const stepsInclude = await buildGoalStepsInclude();
  const goals = await models.Goal.findAll({
    where: { clientUserId },
    include: [
      ...(stepsInclude ? [stepsInclude] : []),
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
    const json = shapeGoalWithProgress(g);
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

  let goals = [];
  try {
    goals = await models.Goal.findAll({
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
  } catch (err) {
    console.error("GET /client/plan/goals base query failed:", {
      message: err?.message,
      sqlMessage: err?.original?.sqlMessage,
    });
    return res.status(500).json({ message: "Nu am putut încărca obiectivele." });
  }

  const goalIds = goals.map((g) => Number(g.id)).filter((n) => Number.isFinite(n));
  const stepsByGoalId = new Map();

  if (goalIds.length && (await hasGoalStepsTable())) {
    const stepCols = await getGoalStepsColumns();
    const hasDone = Boolean(stepCols?.has("done"));
    const hasOrderIndex = Boolean(stepCols?.has("order_index"));
    const hasCreatedAt = Boolean(stepCols?.has("created_at"));

    const attrs = ["id", "goalId", "title"];
    if (hasDone) attrs.push("done");
    if (hasOrderIndex) attrs.push("orderIndex");
    if (hasCreatedAt) attrs.push("createdAt");

    try {
      const rows = await models.GoalStep.findAll({
        where: { goalId: goalIds },
        attributes: attrs,
        order: hasOrderIndex
          ? [[models.GoalStep.sequelize.col("order_index"), "ASC"]]
          : hasCreatedAt
          ? [[models.GoalStep.sequelize.col("created_at"), "ASC"]]
          : [[models.GoalStep.sequelize.col("id"), "ASC"]],
      });

      for (const r of rows) {
        const j = r.toJSON();
        const gid = Number(j.goalId);
        if (!stepsByGoalId.has(gid)) stepsByGoalId.set(gid, []);
        stepsByGoalId.get(gid).push({
          id: j.id,
          title: j.title,
          done: hasDone ? Boolean(j.done) : false,
          ...(hasOrderIndex ? { orderIndex: j.orderIndex } : {}),
          ...(hasCreatedAt ? { createdAt: j.createdAt } : {}),
        });
      }
    } catch (err) {
      console.error("GET /client/plan/goals steps query failed:", {
        message: err?.message,
        sqlMessage: err?.original?.sqlMessage,
      });
    }
  }

  const shapedGoals = goals.map((g) => {
    const lastUpdate = g?.updates?.[0] ?? null;
    const withSteps = {
      ...g.toJSON(),
      steps: stepsByGoalId.get(Number(g.id)) ?? [],
    };
    const json = shapeGoalWithProgress({ toJSON: () => withSteps });
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
  let created = null;
  try {
    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const { title } = req.body || {};

    if (!title || !String(title).trim()) {
      return res
        .status(400)
        .json({ message: "Titlul obiectivului este obligatoriu" });
    }

    const safeTitle = String(title).trim();
    const link = await getActiveLinkForClient(clientUserId);

    created = await models.Goal.create({
      clientUserId,
      therapistId: link?.therapistId ?? null,
      title: safeTitle,
      status: "active",
    });

    const canUseGoalSteps = await hasGoalStepsTable();
    const stepCols = canUseGoalSteps ? await getGoalStepsColumns() : null;
    if (canUseGoalSteps && stepCols) {
      const hasOrderIndex = stepCols.has("order_index");
      const hasDone = stepCols.has("done");
      const generatedSteps = await generateGoalStepsWithAi(safeTitle);
      if (generatedSteps.length) {
        const queryInterface = models.Goal.sequelize.getQueryInterface();
        const now = new Date();
        const rows = generatedSteps.map((stepTitle, index) => {
          const row = {
            goal_id: created.id,
            title: stepTitle,
            created_at: now,
            updated_at: now,
          };
          if (hasOrderIndex) row.order_index = index;
          if (hasDone) row.done = false;
          return row;
        });
        await queryInterface.bulkInsert("goal_steps", rows);
      }
    }

    const stepsInclude = await buildGoalStepsInclude();
    const fullGoal = await models.Goal.findOne({
      where: { id: created.id, clientUserId },
      include: stepsInclude ? [stepsInclude] : [],
    });

    if (!fullGoal) return res.status(201).json({ goal: created });
    return res.status(201).json({ goal: shapeGoalWithProgress(fullGoal) });
  } catch (err) {
    console.error("Create goal error:", err);
    if (created) return res.status(201).json({ goal: created });
    return res.status(500).json({ message: "Nu am putut crea obiectivul." });
  }
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

// PATCH /api/client/plan/goals/:id/steps/:stepId
router.patch(
  "/goals/:id/steps/:stepId",
  requireAuth,
  requireRole("client"),
  async (req, res) => {
    const canUseGoalSteps = await hasGoalStepsTable();
    if (!canUseGoalSteps) {
      return res
        .status(503)
        .json({ message: "Pașii obiectivelor nu sunt disponibili încă. Rulează migrațiile DB." });
    }
    const stepCols = await getGoalStepsColumns();
    const hasDone = Boolean(stepCols?.has("done"));
    if (!hasDone) {
      return res
        .status(503)
        .json({ message: "Coloana 'done' lipsește din goal_steps. Aplică migrațiile DB." });
    }

    const clientUserId = getClientUserId(req);
    if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

    const goalId = Number(req.params.id);
    const stepId = Number(req.params.stepId);
    if (!goalId || Number.isNaN(goalId) || !stepId || Number.isNaN(stepId)) {
      return res.status(400).json({ message: "ID invalid" });
    }

    const goal = await models.Goal.findOne({ where: { id: goalId, clientUserId } });
    if (!goal) return res.status(404).json({ message: "Obiectivul nu a fost găsit" });

    const step = await models.GoalStep.findOne({ where: { id: stepId, goalId } });
    if (!step) return res.status(404).json({ message: "Pasul nu a fost găsit" });

    const nextDone =
      typeof req.body?.done === "boolean" ? req.body.done : !Boolean(step.done);
    await step.update({ done: nextDone });

    const hasOrderIndex = Boolean(stepCols?.has("order_index"));
    const hasCreatedAt = Boolean(stepCols?.has("created_at"));
    const steps = await models.GoalStep.findAll({
      where: { goalId },
      attributes: hasOrderIndex
        ? ["id", "goalId", "title", "done", "orderIndex", "createdAt", "updatedAt"]
        : ["id", "goalId", "title", "done", "createdAt", "updatedAt"],
      order: hasOrderIndex
        ? [[models.GoalStep.sequelize.col("order_index"), "ASC"]]
        : hasCreatedAt
        ? [[models.GoalStep.sequelize.col("created_at"), "ASC"]]
        : [[models.GoalStep.sequelize.col("id"), "ASC"]],
    });

    const progress = computeProgressFromSteps(steps);
    if (progress === 100 && goal.status !== "done") {
      await goal.update({ status: "done" });
    }
    if (progress < 100 && goal.status === "done") {
      await goal.update({ status: "active" });
    }

    return res.json({
      step,
      goal: {
        id: goal.id,
        status: progress === 100 ? "done" : goal.status === "done" ? "active" : goal.status,
        progress,
        stepsDone: steps.filter((s) => Boolean(s.done)).length,
        stepsTotal: steps.length,
      },
    });
  },
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
