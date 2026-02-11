import { app } from "./app.js";
import { env } from "./config/env.js";
import { sequelize } from "./models/index.js";

async function start() {
  try {
    await sequelize.authenticate();
    console.log("✅ DB connected");

    app.listen(env.port, () => {
      console.log(`✅ API running on http://localhost:${env.port}`);
    });
  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
