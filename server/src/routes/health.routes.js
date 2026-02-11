import { Router } from "express";
import { sequelize } from "../config/db.js";

const router = Router();

function baseHealth() {
  return {
    ok: true,
    service: "innery-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };
}

// GET /api/health
router.get("/", (req, res) => {
  return res.json(baseHealth());
});

// GET /api/health/db
router.get("/db", async (req, res) => {
  try {
    await sequelize.query("SELECT 1+1 AS result");
    return res.json({ ...baseHealth(), db: "up" });
  } catch (e) {
    return res.status(500).json({ ...baseHealth(), ok: false, db: "down" });
  }
});

export default router;
