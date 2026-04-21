import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { models } from "../models/index.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import crypto from "crypto";
import { sendPasswordResetEmail } from "../lib/mailer.js";

const router = Router();

const signupSchema = z.object({
  role: z.enum(["therapist", "client"]),
  name: z.string().min(2).max(120),
  email: z.string().email().max(190),
  password: z.string().min(8).max(72),
});

router.post("/signup", async (req, res) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const { role, name, email, password } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await models.User.findOne({ where: { email: normalizedEmail } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await models.User.create({
      role,
      name,
      email: normalizedEmail,
      passwordHash,
    });

    if (role === "client") {
      try {
        await models.Client.update(
          { userId: user.id, status: "Active" },
          {
            where: {
              email: user.email,
              userId: null,
              status: "Invited",
            },
          },
        );
      } catch (e) {
        // IMPORTANT: signup trebuie să reușească și fără invitație / chiar dacă auto-link-ul eșuează
        console.warn("Auto-link invite failed (non-fatal):", e?.message || e);
      }
    }

    // nu trimitem hash-ul înapoi
    return res.status(201).json({
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const loginSchema = z.object({
  email: z.string().email().max(190),
  password: z.string().min(1).max(72),
  rememberMe: z.boolean().optional().default(false),
});

router.post("/login", async (req, res) => {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const { email, password, rememberMe } = parsed.data;
    const normalizedEmail = email.trim().toLowerCase();

    const user = await models.User.findOne({ where: { email: normalizedEmail } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessTokenExpiresIn = rememberMe ? "30d" : "1d";

    const accessToken = jwt.sign(
      { sub: String(user.id), role: user.role },
      env.jwt.accessSecret,
      { expiresIn: accessTokenExpiresIn },
    );

    return res.json({
      accessToken,
      session: {
        rememberMe,
        expiresIn: accessTokenExpiresIn,
      },
      user: {
        id: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(190),
});

const resetPasswordSchema = z.object({
  token: z.string().min(16).max(500),
  newPassword: z.string().min(8).max(72),
});

router.post("/forgot-password", async (req, res) => {
  try {
    const parsed = forgotPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const email = parsed.data.email.trim().toLowerCase();
    const user = await models.User.findOne({ where: { email } });

    if (!user) {
      return res.json({
        ok: true,
        message:
          "Daca exista cont pe acest email, vei primi un link pentru resetarea parolei.",
      });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpiresAt = expiresAt;
    await user.save();

    const resetUrl = `${env.frontendUrl.replace(/\/$/, "")}/auth/forgot-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      resetUrl,
    });

    return res.json({
      ok: true,
      message:
        "Daca exista cont pe acest email, vei primi un link pentru resetarea parolei.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    if (env.nodeEnv !== "production") {
      return res.status(500).json({
        message: "Internal server error",
        detail: err?.message || String(err),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const parsed = resetPasswordSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Invalid input",
        issues: parsed.error.issues,
      });
    }

    const { token, newPassword } = parsed.data;
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const user = await models.User.findOne({
      where: { passwordResetTokenHash: tokenHash },
    });

    if (!user) {
      return res.status(400).json({ message: "Token invalid sau expirat." });
    }

    if (!user.passwordResetExpiresAt || new Date(user.passwordResetExpiresAt) < new Date()) {
      return res.status(400).json({ message: "Token invalid sau expirat." });
    }

    const sameAsCurrent = await bcrypt.compare(newPassword, user.passwordHash);
    if (sameAsCurrent) {
      return res
        .status(400)
        .json({ message: "Parola noua trebuie sa fie diferita de parola actuala." });
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.passwordResetTokenHash = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    return res.json({ ok: true, message: "Parola a fost schimbata cu succes." });
  } catch (err) {
    console.error("Reset password error:", err);
    if (env.nodeEnv !== "production") {
      return res.status(500).json({
        message: "Internal server error",
        detail: err?.message || String(err),
      });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
