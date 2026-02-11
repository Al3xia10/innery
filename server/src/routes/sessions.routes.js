import { Router } from "express";
import { z } from "zod";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireSameParamUser } from "../middleware/ownership.js";

const router = Router();

// GET /api/therapists/:therapistId/sessions
router.get(
  "/therapists/:therapistId/sessions",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);

    const sessions = await models.Session.findAll({
      where: { therapistId },
      include: [
        {
          model: models.User,
          as: "clientUser",
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["startsAt", "DESC"]],
    });

    return res.json({ sessions });
  },
);

const createSessionSchema = z.object({
  clientUserId: z.number().int().positive(),
  startsAt: z.string().datetime(), // ISO datetime
  durationMin: z.number().int().positive().max(600).optional(),
  status: z.enum(["Scheduled", "Completed", "Canceled", "NoShow"]).optional(),
  type: z.enum(["Individual", "Couple", "Group"]).optional(),
  notesPreview: z.string().max(500).optional().nullable(),
});

const updateSessionSchema = z.object({
  startsAt: z.string().datetime().optional(),
  durationMin: z.number().int().positive().max(600).optional(),
  status: z.enum(["Scheduled", "Completed", "Canceled", "NoShow"]).optional(),
  type: z.enum(["Individual", "Couple", "Group"]).optional(),
  notesPreview: z.string().max(500).optional().nullable(),
});

// POST /api/therapists/:therapistId/sessions
router.post(
  "/therapists/:therapistId/sessions",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const parsed = createSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const therapistId = Number(req.params.therapistId);
    const { clientUserId, startsAt, durationMin, status, type, notesPreview } =
      parsed.data;

    // Verificăm că acel client aparține terapeutului
    const link = await models.Client.findOne({
      where: { therapistId, userId: clientUserId },
    });
    if (!link) {
      return res
        .status(403)
        .json({ message: "Client does not belong to this therapist" });
    }

    const session = await models.Session.create({
      therapistId,
      clientUserId,
      startsAt: new Date(startsAt),
      durationMin: durationMin ?? 50,
      status: status ?? "Scheduled",
      type: type ?? "Individual",
      notesPreview: notesPreview ?? null,
    });

    const full = await models.Session.findByPk(session.id, {
      include: [
        {
          model: models.User,
          as: "clientUser",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.status(201).json({ session: full });
  },
);

// PATCH /api/therapists/:therapistId/sessions/:sessionId
router.patch(
  "/therapists/:therapistId/sessions/:sessionId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const sessionId = Number(req.params.sessionId);
    if (Number.isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    const parsed = updateSessionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const session = await models.Session.findOne({
      where: { id: sessionId, therapistId },
    });
    if (!session) return res.status(404).json({ message: "Session not found" });

    const { startsAt, durationMin, status, type, notesPreview } = parsed.data;

    if (startsAt) session.startsAt = new Date(startsAt);
    if (durationMin != null) session.durationMin = durationMin;
    if (status) session.status = status;
    if (type) session.type = type;
    if (notesPreview !== undefined) session.notesPreview = notesPreview;

    await session.save();

    const full = await models.Session.findByPk(session.id, {
      include: [
        {
          model: models.User,
          as: "clientUser",
          attributes: ["id", "name", "email"],
        },
      ],
    });

    return res.json({ session: full });
  },
);

// DELETE /api/therapists/:therapistId/sessions/:sessionId
router.delete(
  "/therapists/:therapistId/sessions/:sessionId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const sessionId = Number(req.params.sessionId);
    if (Number.isNaN(sessionId)) {
      return res.status(400).json({ message: "Invalid sessionId" });
    }

    const deleted = await models.Session.destroy({
      where: { id: sessionId, therapistId },
    });
    if (!deleted) return res.status(404).json({ message: "Session not found" });

    return res.status(204).send();
  },
);

export default router;
