import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { models } from "../models/index.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// PATCH /api/settings/profile
// body: { name?: string, email?: string }
const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().toLowerCase().email().optional(),
});

router.patch("/settings/profile", requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const userId = req.user.id;
  const { name, email } = parsed.data;

  const user = await models.User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // dacă schimbă email, verifică unicitate
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
});

// PATCH /api/settings/password
// body: { oldPassword: string, newPassword: string }
const changePasswordSchema = z.object({
  oldPassword: z.string().min(6),
  newPassword: z.string().min(8).max(200),
});

router.patch("/settings/password", requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid input", issues: parsed.error.issues });
  }

  const userId = req.user.id;
  const { oldPassword, newPassword } = parsed.data;

  const user = await models.User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // IMPORTANT: adaptează numele câmpului la modelul tău:
  // - la tine probabil e "passwordHash"
  const hash = user.passwordHash;
  if (!hash)
    return res.status(400).json({ message: "Account has no password set" });

  const ok = await bcrypt.compare(oldPassword, hash);
  if (!ok)
    return res.status(401).json({ message: "Old password is incorrect" });

  const nextHash = await bcrypt.hash(newPassword, 10);
  user.passwordHash = nextHash;
  await user.save();

  return res.json({ ok: true });
});

export default router;
