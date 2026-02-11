import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { models } from "../models/index.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const user = await models.User.findByPk(req.user.id, {
    attributes: ["id", "role", "name", "email", "createdAt", "updatedAt"],
  });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ user });
});

export default router;
