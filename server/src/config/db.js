import { Sequelize } from "sequelize";
import { env } from "./env.js";

const common = {
  dialect: "mysql",
  logging: false,
  dialectOptions: {
    // helps a lot on Railway if DB warms up / DNS slow
    connectTimeout: 20000,
  },
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
};

export const sequelize = env.db.url
  ? new Sequelize(env.db.url, common)
  : new Sequelize(env.db.name, env.db.user, env.db.password, {
      host: env.db.host,
      port: env.db.port,
      ...common,
    });
