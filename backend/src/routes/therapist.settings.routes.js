import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { models } from "../models/index.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

function getTherapistUserId(req) {
  const n = Number(req.user?.sub ?? req.user?.id);
  return !n || Number.isNaN(n) ? null : n;
}

function getAuthedUserId(req) {
  const n = Number(req.user?.id ?? req.user?.sub);
  return !n || Number.isNaN(n) ? null : n;
}

function pickPasswordHashField(user) {
  if (!user) return null;
  if (typeof user.passwordHash === "string") return "passwordHash";
  if (typeof user.password_hash === "string") return "password_hash";
  if (typeof user.password === "string") return "password";
  return null;
}

function clampBool(v) {
  if (typeof v === "boolean") return v;
  if (v === "true") return true;
  if (v === "false") return false;
  return null;
}

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

// GET /api/therapist/settings/profile
router.get(
  "/therapist/settings/profile",
  requireAuth,
  requireRole("therapist"),
  async (req, res) => {
    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  },
);

// PATCH /api/therapist/settings/profile
router.patch(
  "/therapist/settings/profile",
  requireAuth,
  requireRole("therapist"),
  async (req, res) => {
    const parsed = updateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { name, email } = parsed.data;

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (email && email !== user.email) {
      const exists = await models.User.findOne({ where: { email } });
      if (exists) {
        return res.status(409).json({ message: "Email already in use" });
      }
      user.email = email;
    }

    if (name) user.name = name;

    await user.save();

    return res.json({
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  },
);

const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(8).max(200),
});

// PATCH /api/therapist/settings/password
router.patch(
  "/therapist/settings/password",
  requireAuth,
  requireRole("therapist"),
  async (req, res) => {
    const parsed = changePasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res
        .status(400)
        .json({ message: "Invalid input", issues: parsed.error.issues });
    }

    const userId = getAuthedUserId(req);
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const { oldPassword, newPassword } = parsed.data;

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashField = pickPasswordHashField(user);
    const currentHash = hashField ? user[hashField] : null;

    if (!currentHash) {
      return res.status(400).json({ message: "Account has no password set" });
    }

    const ok = await bcrypt.compare(oldPassword, currentHash);
    if (!ok) {
      return res.status(401).json({ message: "Old password is incorrect" });
    }

    const nextHash = await bcrypt.hash(newPassword, 10);
    if (hashField) {
      user[hashField] = nextHash;
    } else {
      return res
        .status(500)
        .json({ message: "Password field not configured on User model" });
    }

    await user.save();
    return res.json({ ok: true });
  },
);

// GET /api/therapist/settings
router.get(
  "/therapist/settings",
  requireAuth,
  requireRole("therapist"),
  async (req, res) => {
    const therapistUserId = getTherapistUserId(req);
    if (!therapistUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let settings = await models.TherapistSettings.findOne({
      where: { therapistUserId },
    });

    if (!settings) {
      settings = await models.TherapistSettings.create({
        therapistUserId,
        emailNotifications: true,
        noteReminders: true,
        newClientAlerts: true,
        weeklySummary: true,
      });
    }

    return res.json({ settings });
  },
);

// PUT /api/therapist/settings
router.put(
  "/therapist/settings",
  requireAuth,
  requireRole("therapist"),
  async (req, res) => {
    const therapistUserId = getTherapistUserId(req);
    if (!therapistUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const body = req.body || {};
    const next = {};

    const emailNotifications = clampBool(body.emailNotifications);
    if (emailNotifications != null) {
      next.emailNotifications = emailNotifications;
    }

    const noteReminders = clampBool(body.noteReminders);
    if (noteReminders != null) {
      next.noteReminders = noteReminders;
    }

    const newClientAlerts = clampBool(body.newClientAlerts);
    if (newClientAlerts != null) {
      next.newClientAlerts = newClientAlerts;
    }

    const weeklySummary = clampBool(body.weeklySummary);
    if (weeklySummary != null) {
      next.weeklySummary = weeklySummary;
    }

    let settings = await models.TherapistSettings.findOne({
      where: { therapistUserId },
    });

    if (!settings) {
      settings = await models.TherapistSettings.create({
        therapistUserId,
        emailNotifications: true,
        noteReminders: true,
        newClientAlerts: true,
        weeklySummary: true,
        ...next,
      });
    } else {
      await settings.update(next);
      settings = await models.TherapistSettings.findOne({
        where: { therapistUserId },
      });
    }

    return res.json({ settings });
  },
);

export default router;
