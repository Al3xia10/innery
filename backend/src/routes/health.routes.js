import { Router } from "express";
import { sequelize } from "../config/db.js";

const router = Router();

// GET /api/health  -> service up (no DB hit)
router.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "innery-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// GET /api/health/db -> DB check
router.get("/db", async (req, res) => {
  try {
    await sequelize.query("SELECT 1+1 AS result");
    res.json({
      ok: true,
      service: "innery-api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: "up",
    });
  } catch (e) {
    res.status(200).json({
      ok: false,
      service: "innery-api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: "down",
      // optional: te ajută enorm în Railway logs
      error: e?.message ? String(e.message) : "DB connection failed",
    });
  }
});

export default router;
