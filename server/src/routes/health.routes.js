import { Router } from "express";
import { sequelize } from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    await sequelize.query("SELECT 1+1 AS result");
    res.json({ ok: true, db: "up" });
  } catch (e) {
    res.status(500).json({ ok: false, db: "down" });
  }
});

export default router;
