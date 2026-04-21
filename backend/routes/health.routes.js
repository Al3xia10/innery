import { Router } from "express";
import { sequelize } from "../config/config.js";

export function createHealthRouter(
  { getDbState = () => ({ ready: false, lastError: null }) } = {},
) {
  const router = Router();

  router.get("/", (_req, res) => {
    res.json({
      ok: true,
      service: "innery-api",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  router.get("/ready", (_req, res) => {
    const { ready, lastError } = getDbState();

    res.status(ready ? 200 : 503).json({
      ok: true,
      db: ready ? "up" : "down",
      lastDbError: ready ? null : (lastError?.message ?? "db not connected"),
      env: process.env.RAILWAY_ENVIRONMENT ? "railway" : "local",
    });
  });

  router.get("/db", async (_req, res) => {
    try {
      await sequelize.query("SELECT 1+1 AS result");
      res.json({
        ok: true,
        service: "innery-api",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "up",
      });
    } catch (error) {
      res.status(200).json({
        ok: false,
        service: "innery-api",
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        db: "down",
        error: error?.message ? String(error.message) : "DB connection failed",
      });
    }
  });

  return router;
}

export default createHealthRouter;
