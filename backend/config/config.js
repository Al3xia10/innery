import "dotenv/config";
import { Sequelize } from "sequelize";

const DIALECT = "mysql";
const DEFAULT_PORT = 3306;
const DB_POOL = {
  max: 10,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

function num(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildDatabaseConfig(overrides = {}) {
  const base = {
    dialect: DIALECT,
    logging: false,
    dialectOptions: {
      connectTimeout: 20000,
    },
    pool: DB_POOL,
  };

  if (process.env.DATABASE_URL) {
    return {
      ...base,
      use_env_variable: "DATABASE_URL",
      ...overrides,
    };
  }

  return {
    ...base,
    host: process.env.DB_HOST || "127.0.0.1",
    port: num(process.env.DB_PORT, DEFAULT_PORT),
    database: process.env.DB_NAME || "innery",
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    ...overrides,
  };
}

const defaultDatabaseName = process.env.DB_NAME || "innery";

export const sequelizeConfig = {
  development: buildDatabaseConfig(),
  test: buildDatabaseConfig({
    database: process.env.DB_NAME_TEST || defaultDatabaseName,
  }),
  production: buildDatabaseConfig(),
};

const runtimeEnvironment =
  process.env.NODE_ENV === "production"
    ? "production"
    : process.env.NODE_ENV === "test"
      ? "test"
      : "development";

const activeDatabaseConfig = sequelizeConfig[runtimeEnvironment];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: num(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  frontendUrl:
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "30d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "1d",
  },
  ai: {
    openaiApiKey: process.env.OPENAI_API_KEY || "",
    openaiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  },
  mail: {
    host: process.env.SMTP_HOST || "",
    port: num(process.env.SMTP_PORT, 587),
    secure:
      String(process.env.SMTP_SECURE || "").toLowerCase() === "true" ||
      num(process.env.SMTP_PORT, 587) === 465,
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
    from: process.env.SMTP_FROM || "Innery <no-reply@innery.app>",
  },
};

const { use_env_variable, ...sequelizeOptions } = activeDatabaseConfig;

export const sequelize = use_env_variable
  ? new Sequelize(process.env[use_env_variable], sequelizeOptions)
  : new Sequelize(
      activeDatabaseConfig.database,
      activeDatabaseConfig.username,
      activeDatabaseConfig.password,
      sequelizeOptions,
    );

export default sequelizeConfig;
