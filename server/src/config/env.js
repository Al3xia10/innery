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

  corsOrigin: process.env.CORS_ORIGIN || "*",

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "30d",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "1d",
  },
};
