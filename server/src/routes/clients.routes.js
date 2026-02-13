import { Router } from "express";
import { z } from "zod";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { requireSameParamUser } from "../middleware/ownership.js";

const router = Router();

const inviteSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(120).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["Active", "Paused"]),
});

/**
 * GET /api/therapists/:therapistId/clients
 * Returns unified list: linked clients + invited clients.
 */
router.get(
  "/therapists/:therapistId/clients",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);

    const rows = await models.Client.findAll({
      where: { therapistId },
      include: [
        {
          model: models.User,
          as: "user",
          required: false,
          attributes: ["id", "name", "email", "role"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const clients = rows.map((r) => {
      // Linked (Active/Paused)
      if (r.userId) {
        return {
          kind: "linked",
          id: r.user?.id ?? r.userId,
          therapistId: r.therapistId,
          status: r.status,
          user: r.user,
        };
      }

      // Invited (pending)
      return {
        kind: "invite",
        id: `invite_${r.id}`,
        therapistId: r.therapistId,
        status: "Invited",
        email: r.email,
        name: r.name ?? r.email,
      };
    });

    return res.json({ clients });
  },
);

/**
 * GET /api/therapists/:therapistId/clients/:clientId
 * clientId = client User.id (only linked clients)
 */
router.get(
  "/therapists/:therapistId/clients/:clientId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const clientId = Number(req.params.clientId);
    if (Number.isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    const client = await models.Client.findOne({
      where: { therapistId, userId: clientId },
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    if (!client) return res.status(404).json({ message: "Client not found" });

    return res.json({ client });
  },
);

/**
 * POST /api/therapists/:therapistId/clients
 * Creates an invite if user doesn't exist; links immediately if user exists (role=client).
 */
router.post(
  "/therapists/:therapistId/clients",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);

    const parsed = inviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const { email, name } = parsed.data;

    // If the client already has an account, link immediately.
    const user = await models.User.findOne({ where: { email } });

    if (user) {
      if (user.role !== "client") {
        return res.status(409).json({
          message: "A user with this email already exists but is not a client.",
        });
      }

      const existing = await models.Client.findOne({
        where: { therapistId, userId: user.id },
      });

      if (existing) {
        return res
          .status(409)
          .json({ message: "Client is already linked to this therapist." });
      }

      // Remove a pending invite for this email if it exists
      await models.Client.destroy({
        where: { therapistId, userId: null, status: "Invited", email },
      });

      const row = await models.Client.create({
        therapistId,
        userId: user.id,
        status: "Active",
      });

      const full = await models.Client.findOne({
        where: { id: row.id },
        include: [
          {
            model: models.User,
            as: "user",
            attributes: ["id", "name", "email", "role"],
          },
        ],
      });

      return res.status(201).json({ kind: "linked", client: full });
    }

    // Otherwise create an invitation row
    const existingInvite = await models.Client.findOne({
      where: { therapistId, userId: null, status: "Invited", email },
    });

    if (existingInvite) {
      return res
        .status(409)
        .json({ message: "Invite already exists for this email." });
    }

    const invite = await models.Client.create({
      therapistId,
      userId: null,
      email,
      name: name ?? null,
      status: "Invited",
    });

    return res.status(201).json({
      kind: "invite",
      invite: {
        id: `invite_${invite.id}`,
        therapistId,
        email: invite.email,
        name: invite.name ?? invite.email,
        status: invite.status,
      },
    });
  },
);

/**
 * PATCH /api/therapists/:therapistId/clients/:clientId
 * Update linked client status (Active/Paused). Invites cannot be paused.
 */
router.patch(
  "/therapists/:therapistId/clients/:clientId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);

    const rawId = String(req.params.clientId);
    if (rawId.startsWith("invite_")) {
      return res
        .status(400)
        .json({ message: "Cannot change status for an invited client." });
    }

    const clientId = Number(rawId);
    if (Number.isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const row = await models.Client.findOne({
      where: { therapistId, userId: clientId },
    });

    if (!row) return res.status(404).json({ message: "Client not found" });

    row.status = parsed.data.status;
    await row.save();

    const full = await models.Client.findOne({
      where: { therapistId, userId: clientId },
      include: [
        {
          model: models.User,
          as: "user",
          attributes: ["id", "name", "email", "role"],
        },
      ],
    });

    return res.json({ client: full });
  },
);

/**
 * DELETE /api/therapists/:therapistId/clients/:clientId
 * - if clientId is invite_<id>: deletes the invite row
 * - else: unlinks the linked client row
 */
router.delete(
  "/therapists/:therapistId/clients/:clientId",
  requireAuth,
  requireRole("therapist"),
  requireSameParamUser("therapistId"),
  async (req, res) => {
    const therapistId = Number(req.params.therapistId);
    const rawId = String(req.params.clientId);

    if (rawId.startsWith("invite_")) {
      const inviteId = Number(rawId.replace("invite_", ""));
      if (Number.isNaN(inviteId))
        return res.status(400).json({ message: "Invalid invite id" });

      const deletedInvite = await models.Client.destroy({
        where: { id: inviteId, therapistId, userId: null, status: "Invited" },
      });

      if (!deletedInvite)
        return res.status(404).json({ message: "Invite not found" });

      return res.status(204).send();
    }

    const clientId = Number(rawId);
    if (Number.isNaN(clientId)) {
      return res.status(400).json({ message: "Invalid clientId" });
    }

    const deleted = await models.Client.destroy({
      where: { therapistId, userId: clientId },
    });

    if (!deleted) return res.status(404).json({ message: "Client not found" });

    return res.status(204).send();
  },
);

export default router;
