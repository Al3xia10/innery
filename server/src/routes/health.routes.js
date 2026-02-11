import { Router } from "express";

const router = Router();

/**
 * Basic health check.
 * Always responds if the API process is running.
 * DB status should be handled separately in server.js if needed.
 */
router.get("/", (_req, res) => {
  res.status(200).json({
    ok: true,
    service: "innery-api",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

export default router;
