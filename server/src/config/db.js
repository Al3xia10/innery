import { Sequelize } from "sequelize";
import { env } from "./env.js";

function must(v, name) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

// Support both local env.* and Railway-provided MySQL vars.
// Priority: Railway MYSQL* -> existing env.db.* -> legacy DB_* (if present)
const host = process.env.MYSQLHOST || env?.db?.host || process.env.DB_HOST;

const portRaw =
  process.env.MYSQLPORT || env?.db?.port || process.env.DB_PORT || 3306;

const dbName =
  process.env.MYSQLDATABASE || env?.db?.name || process.env.DB_NAME;

const dbUser = process.env.MYSQLUSER || env?.db?.user || process.env.DB_USER;

const dbPassword =
  process.env.MYSQLPASSWORD ||
  env?.db?.password ||
  process.env.DB_PASSWORD ||
  "";

export const sequelize = new Sequelize(
  must(dbName, "MYSQLDATABASE/DB_NAME"),
  must(dbUser, "MYSQLUSER/DB_USER"),
  dbPassword,
  {
    host: must(host, "MYSQLHOST/DB_HOST"),
    port: Number(portRaw),
    dialect: "mysql",
    logging: false,
    pool: {
      max: 10,
      min: 0,
      idle: 10000,
      acquire: 30000,
    },
    dialectOptions: {
      connectTimeout: 15000,
    },
  },
);

// Default export to avoid ESM import issues in other files
export default sequelize;
