import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { models } from "../models/index.js";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

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

    const existing = await models.User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await models.User.create({
      role,
      name,
      email,
      passwordHash,
    });

    // Auto-link: dacă un client își face cont și există o invitație (Invited) pe email,
    // o transformăm în link activ (Active) setând userId.
    if (role === "client") {
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

    const { email, password } = parsed.data;

    const user = await models.User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const accessToken = jwt.sign(
      { sub: String(user.id), role: user.role },
      env.jwt.accessSecret,
      { expiresIn: "1d" },
    );

    return res.json({
      accessToken,
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

export default router;
