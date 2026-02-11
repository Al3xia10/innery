import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { env } from "./config/env.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import therapistsRoutes from "./routes/therapists.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

export const app = express();

// If you deploy behind a proxy (Render, Nginx, etc.), this helps rate-limit + IP handling.
app.set("trust proxy", 1);

// ---- Logging ----
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

// ---- Security headers ----
app.use(
  helmet({
    // Avoid dev-time issues when loading assets from other origins.
    crossOriginResourcePolicy: false,
  }),
);

// ---- CORS (dev + prod) ----
// Supports comma-separated origins in env, e.g.
// CORS_ORIGIN=http://localhost:3000,https://innery.ro
const allowedOrigins = (
  process.env.CORS_ORIGIN || "http://localhost:3000,https://innery.vercel.app"
)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, cb) {
      // Allow tools like Thunder Client/Postman (no Origin header)
      if (!origin) return cb(null, true);

      // Allow exact matches
      if (allowedOrigins.includes(origin)) return cb(null, true);

      // Allow Vercel preview deployments (*.vercel.app)
      if (origin.endsWith(".vercel.app")) return cb(null, true);

      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);

// Preflight (Express v5/path-to-regexp doesn't accept "*")
app.options(/.*/, cors());

// ---- Body parsers ----
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// ---- Rate limiting ----
// Global limiter (fairly generous)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 600, // 600 req / 15 min / IP
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

// Stricter limiter for auth endpoints (anti brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // 30 attempts / 15 min / IP
  standardHeaders: true,
  legacyHeaders: false,
});

// ---- Routes ----
app.use("/api/health", healthRoutes);
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/therapists", therapistsRoutes);
app.use("/api", sessionsRoutes);
app.use("/api", notesRoutes);
app.use("/api", clientsRoutes);
app.use("/api", settingsRoutes);

// ---- Errors (CORS) ----
app.use((err, req, res, next) => {
  if (String(err?.message || "").includes("CORS blocked")) {
    return res.status(403).json({ message: err.message });
  }
  return next(err);
});

// ---- Global error handler ----
app.use((err, req, res, next) => {
  console.error("❌ Unhandled error:", err);

  const isProd = env.nodeEnv === "production";
  const status = err?.status || 500;

  if (res.headersSent) return next(err);

  return res.status(status).json({
    message: status === 500 ? "Internal server error" : err.message || "Error",
    ...(isProd ? {} : { stack: err.stack }),
  });
});

// ---- 404 ----
app.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});
