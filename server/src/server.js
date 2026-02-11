import { app } from "./app.js";
import { env } from "./config/env.js";
import { sequelize } from "./models/index.js";

let dbReady = false;
let lastDbError = null;

async function connectWithRetry() {
  const max = 30; // ~30 * 2s = 60s
  for (let i = 1; i <= max; i++) {
    try {
      await sequelize.authenticate();
      dbReady = true;
      lastDbError = null;
      console.log("✅ DB connected");
      return;
    } catch (err) {
      dbReady = false;
      lastDbError = err;
      console.log(`⏳ DB connect retry ${i}/${max}...`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  console.error("❌ DB failed to connect after retries:", lastDbError);
}

async function start() {
  // 1) Start API first (so health works)
  const port = env.port || process.env.PORT || 4000;

  app.get("/api/health", (_req, res) => {
    res.status(dbReady ? 200 : 503).json({
      ok: true,
      db: dbReady ? "up" : "down",
      lastDbError: dbReady
        ? null
        : (lastDbError?.message ?? "db not connected"),
      env: process.env.RAILWAY_ENVIRONMENT ? "railway" : "local",
    });
  });

  app.listen(port, "0.0.0.0", () => {
    console.log(`✅ API running on http://0.0.0.0:${port}`);
  });

  // 2) Connect DB in background with retry
  connectWithRetry();
}

start();
