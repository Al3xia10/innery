import { createApp } from "./app.js";
import { env } from "./config/config.js";
import { sequelize } from "./models/index.js";

let dbReady = false;
let lastDbError = null;

function validateRuntimeConfig() {
  if (env.nodeEnv === "test") return;

  if (!env.jwt.accessSecret || !env.jwt.refreshSecret) {
    throw new Error(
      "Missing JWT secrets: set JWT_ACCESS_SECRET and JWT_REFRESH_SECRET.",
    );
  }
}

async function connectWithRetry() {
  const maxRetries = 30;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      await sequelize.authenticate();
      dbReady = true;
      lastDbError = null;
      console.log("✅ DB connected");
      return;
    } catch (error) {
      dbReady = false;
      lastDbError = error;
      console.log(`⏳ DB connect retry ${attempt}/${maxRetries}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.error("❌ DB failed to connect after retries:", lastDbError);
}

async function start() {
  validateRuntimeConfig();

  const port = env.port || process.env.PORT || 4000;
  const app = createApp({
    getDbState: () => ({
      ready: dbReady,
      lastError: lastDbError,
    }),
  });

  app.listen(port, () => {
    console.log(`✅ API running on http://0.0.0.0:${port}`);
  });

  connectWithRetry();
}

start();
