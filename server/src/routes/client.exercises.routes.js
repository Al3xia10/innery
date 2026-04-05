import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { models } from "../models/index.js";

const router = Router();

function getClientUserId(req) {
  const userId = req.user?.id;
  if (!userId) return null;
  return Number(userId);
}

// GET /api/client/exercises
router.get("/", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const exercises = await models.Exercise.findAll({
    where: { clientUserId },
    order: [[models.Exercise.sequelize.col("updated_at"), "DESC"]],
  });

  return res.json({ exercises });
});

// POST /api/client/exercises
router.post("/", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const { title, kind, minutes, note } = req.body || {};

  if (!title || !String(title).trim()) {
    return res
      .status(400)
      .json({ message: "Titlul exercițiului este obligatoriu" });
  }

  const allowedKinds = ["Exercițiu", "Rutină", "Experiment"];
  const nextKind = kind == null ? "Exercițiu" : String(kind);
  if (!allowedKinds.includes(nextKind)) {
    return res.status(400).json({ message: "Tip de exercițiu invalid" });
  }

  let nextMinutes = null;
  if (minutes != null && String(minutes) !== "") {
    const parsedMinutes = Number(minutes);
    if (!Number.isFinite(parsedMinutes) || parsedMinutes < 0) {
      return res
        .status(400)
        .json({ message: "Durata trebuie să fie un număr valid" });
    }
    nextMinutes = Math.round(parsedMinutes);
  }

  const created = await models.Exercise.create({
    clientUserId,
    therapistId: null,
    title: String(title).trim(),
    kind: nextKind,
    minutes: nextMinutes,
    note:
      note == null || String(note).trim() === "" ? null : String(note).trim(),
    done: false,
  });

  return res.status(201).json({ exercise: created });
});

async function updateExerciseHandler(req, res) {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  if (!id || Number.isNaN(id)) {
    return res.status(400).json({ message: "ID invalid" });
  }

  const exercise = await models.Exercise.findOne({
    where: { id, clientUserId },
  });

  if (!exercise) {
    return res.status(404).json({ message: "Exercițiul nu a fost găsit" });
  }

  const { title, kind, minutes, note, done } = req.body || {};
  const patch = {};

  if (title !== undefined) {
    if (!String(title).trim()) {
      return res.status(400).json({ message: "Titlul nu poate fi gol" });
    }
    patch.title = String(title).trim();
  }

  if (kind !== undefined) {
    const allowedKinds = ["Exercițiu", "Rutină", "Experiment"];
    const nextKind = String(kind);
    if (!allowedKinds.includes(nextKind)) {
      return res.status(400).json({ message: "Tip de exercițiu invalid" });
    }
    patch.kind = nextKind;
  }

  if (minutes !== undefined) {
    if (minutes == null || String(minutes) === "") {
      patch.minutes = null;
    } else {
      const parsedMinutes = Number(minutes);
      if (!Number.isFinite(parsedMinutes) || parsedMinutes < 0) {
        return res
          .status(400)
          .json({ message: "Durata trebuie să fie un număr valid" });
      }
      patch.minutes = Math.round(parsedMinutes);
    }
  }

  if (note !== undefined) {
    patch.note =
      note == null || String(note).trim() === "" ? null : String(note).trim();
  }

  if (done !== undefined) {
    patch.done = Boolean(done);
  }

  if (Object.keys(patch).length === 0) {
    return res.json({ exercise });
  }

  await exercise.update(patch);

  return res.json({ exercise });
}

// PUT/PATCH /api/client/exercises/:id
router.put("/:id", requireAuth, requireRole("client"), updateExerciseHandler);
router.patch("/:id", requireAuth, requireRole("client"), updateExerciseHandler);

// DELETE /api/client/exercises/:id
router.delete("/:id", requireAuth, requireRole("client"), async (req, res) => {
  const clientUserId = getClientUserId(req);
  if (!clientUserId) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  const exercise = await models.Exercise.findOne({
    where: { id, clientUserId },
  });

  if (!exercise) {
    return res.status(404).json({ message: "Exercițiul nu a fost găsit" });
  }

  await exercise.destroy();

  return res.json({ ok: true });
});

export default router;
