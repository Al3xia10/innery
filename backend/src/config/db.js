import { Sequelize } from "sequelize";
import { env } from "./env.js";

// Dacă există DATABASE_URL (ex: Railway), o folosim direct.
// Altfel, folosim variabilele clasice (fallback pentru local).

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 20000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  const DB_HOST = process.env.DB_HOST ?? env.db.host;
  const DB_PORT = Number(process.env.DB_PORT ?? env.db.port ?? 3306);
  const DB_NAME = process.env.DB_NAME ?? env.db.name;
  const DB_USER = process.env.DB_USER ?? env.db.user;
  const DB_PASSWORD = process.env.DB_PASSWORD ?? env.db.password;

  if (process.env.DB_CONNECT_DEBUG === "true") {
    console.log("🔎 DB config:", {
      DB_HOST,
      DB_PORT,
      DB_NAME,
      DB_USER,
    });
  }

  sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
    host: DB_HOST,
    port: DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      connectTimeout: 20000,
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
}

export { sequelize };
