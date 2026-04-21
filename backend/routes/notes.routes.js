import { Router } from "express";
import { z } from "zod";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireSameParamUser } from "../middleware/ownership.js";

const router = Router();

async function requireSessionOwnership(req, res, next) {
  const therapistId = Number(req.params.therapistId);
  const sessionId = Number(req.params.sessionId);
  if (Number.isNaN(sessionId))
    return res.status(400).json({ message: "Invalid sessionId" });

  const session = await models.Session.findOne({
    where: { id: sessionId, therapistId },
  });
  if (!session) {
    return res
      .status(404)
      .json({ message: "Session not found for this therapist" });
  }

  req.sessionRecord = session;
  return next();
}

// GET /api/therapists/:therapistId/sessions/:sessionId/notes
router.get(
  "/therapists/:therapistId/sessions/:sessionId/notes",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  requireSessionOwnership,
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const sessionId = req.sessionRecord.id;

    const notes = await models.Note.findAll({
      where: { sessionId, therapistId },
      order: [["createdAt", "DESC"]],
    });

    return res.json({ notes });
  },
);

const createNoteSchema = z.object({
  content: z.string().min(1).max(10000),
});

// POST /api/therapists/:therapistId/sessions/:sessionId/notes
router.post(
  "/therapists/:therapistId/sessions/:sessionId/notes",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  requireSessionOwnership,
  async (req, res) => {
    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const therapistId = Number(req.params.therapistId);
    const sessionId = req.sessionRecord.id;

    const note = await models.Note.create({
      therapistId,
      sessionId,
      content: parsed.data.content,
    });

    const full = await models.Note.findByPk(note.id);
    return res.status(201).json({ note: full });
  },
);

// GET /api/therapists/:therapistId/notes
// Notes hub (sidebar): returns all notes for this therapist with session + client context.
router.get(
  "/therapists/:therapistId/notes",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);

    const notes = await models.Note.findAll({
      where: { therapistId },
      required: false,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: models.Session,
          as: "session",
          attributes: [
            "id",
            "startsAt",
            "status",
            "clientUserId",
            "durationMin",
          ],
          include: [
            {
              model: models.User,
              as: "clientUser",
              attributes: ["id", "name", "email"],
            },
          ],
        },
      ],
    });

    return res.json({ notes });
  },
);

// PATCH /api/therapists/:therapistId/notes/:noteId
router.patch(
  "/therapists/:therapistId/notes/:noteId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const noteId = Number(req.params.noteId);
    if (Number.isNaN(noteId)) {
      return res.status(400).json({ message: "Invalid noteId" });
    }

    const parsed = createNoteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const note = await models.Note.findOne({
      where: { id: noteId, therapistId },
      include: [
        {
          model: models.Session,
          as: "session",
          attributes: ["id", "therapistId"],
        },
      ],
    });
    if (!note) return res.status(404).json({ message: "Note not found" });

    note.content = parsed.data.content;
    await note.save();

    return res.json({ note });
  },
);

// DELETE /api/therapists/:therapistId/notes/:noteId
router.delete(
  "/therapists/:therapistId/notes/:noteId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const noteId = Number(req.params.noteId);
    if (Number.isNaN(noteId)) {
      return res.status(400).json({ message: "Invalid noteId" });
    }

    const note = await models.Note.findOne({
      where: { id: noteId, therapistId },
    });

    if (!note) return res.status(404).json({ message: "Note not found" });

    await note.destroy();
    return res.status(204).send();
  },
);

export default router;
