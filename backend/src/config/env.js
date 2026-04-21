// server/src/config/env.js
import "dotenv/config";

function num(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function parseDbUrl(dbUrl) {
  const u = new URL(dbUrl);
  return {
    host: u.hostname,
    port: u.port ? Number(u.port) : 3306,
    name: u.pathname?.replace(/^\//, "") || "",
    user: decodeURIComponent(u.username || ""),
    password: decodeURIComponent(u.password || ""),
    url: dbUrl,
  };
}

const dbFromUrl = process.env.DATABASE_URL
  ? parseDbUrl(process.env.DATABASE_URL)
  : null;

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: num(process.env.PORT, 4000),

  db: {
    // prefer DATABASE_URL if present
    ...(dbFromUrl ?? {}),
    host: dbFromUrl?.host ?? (process.env.DB_HOST || "127.0.0.1"),
    port: dbFromUrl?.port ?? num(process.env.DB_PORT, 3306),
    name: dbFromUrl?.name ?? (process.env.DB_NAME || "innery"),
    user: dbFromUrl?.user ?? (process.env.DB_USER || "root"),
    password: dbFromUrl?.password ?? (process.env.DB_PASSWORD || ""),
    url: dbFromUrl?.url ?? null,
  },

  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

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

  frontendUrl:
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    "http://localhost:3000",

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
