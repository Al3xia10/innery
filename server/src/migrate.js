import path from "path";
import { fileURLToPath } from "url";
import { Umzug, SequelizeStorage } from "umzug";
import { sequelize } from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const umzug = new Umzug({
  migrations: {
    glob: path.join(__dirname, "..", "migrations", "*.{js,cjs}"),
  },
  context: sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize }),
  logger: console,
});

const cmd = process.argv[2];

try {
  if (cmd === "up") {
    await umzug.up();
    console.log("✅ Migrations applied");
  } else if (cmd === "down") {
    await umzug.down();
    console.log("✅ Last migration reverted");
  } else if (cmd === "pending") {
    const pending = await umzug.pending();
    console.log(
      "🕒 Pending migrations:",
      pending.map((m) => m.name),
    );
  } else if (cmd === "executed") {
    const done = await umzug.executed();
    console.log(
      "✅ Executed migrations:",
      done.map((m) => m.name),
    );
  } else {
    console.log("Usage: node src/migrate.js <up|down|pending|executed>");
    process.exit(1);
  }

  process.exit(0);
} catch (err) {
  console.error("❌ Migration error:", err);
  process.exit(1);
}
