import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/config.js";
import { createHealthRouter } from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import therapistsRoutes from "./routes/therapists.routes.js";
import sessionsRoutes from "./routes/sessions.routes.js";
import notesRoutes from "./routes/notes.routes.js";
import clientsRoutes from "./routes/clients.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import clientTodayRoutes from "./routes/client.today.routes.js";
import clientPlanRoutes from "./routes/client.plan.routes.js";
import clientJournalRoutes from "./routes/client.journal.routes.js";
import clientSettingsRoutes from "./routes/client.settings.routes.js";
import therapistSettingsRoutes from "./routes/therapist.settings.routes.js";
import clientExercisesRoutes from "./routes/client.exercises.routes.js";

export function createApp(
  { getDbState = () => ({ ready: false, lastError: null }) } = {},
) {
  const app = express();

  app.set("trust proxy", 1);

  app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    }),
  );

  const allowedOrigins = (env.corsOrigin || "http://localhost:3000")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.includes("*")) {
    throw new Error(
      "CORS_ORIGIN cannot contain '*' when credentials are enabled. Use explicit origins.",
    );
  }

  const allowVercelPreview = process.env.ALLOW_VERCEL_PREVIEW === "true";

  const corsOptions = {
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      if (allowVercelPreview && origin.endsWith(".vercel.app")) {
        return cb(null, true);
      }
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  };

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 600,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use("/api/health", createHealthRouter({ getDbState }));
  app.use("/api/auth", authLimiter, authRoutes);
  app.use("/api/me", meRoutes);
  app.use("/api/therapists", therapistsRoutes);
  app.use("/api", sessionsRoutes);
  app.use("/api", notesRoutes);
  app.use("/api", clientsRoutes);
  app.use("/api", settingsRoutes);
  app.use("/api", clientTodayRoutes);
  app.use("/api/client/plan", clientPlanRoutes);
  app.use("/api/client", clientJournalRoutes);
  app.use("/api", clientSettingsRoutes);
  app.use("/api", therapistSettingsRoutes);
  app.use("/api/client/exercises", clientExercisesRoutes);

  app.use((err, req, res, next) => {
    if (String(err?.message || "").includes("CORS blocked")) {
      return res.status(403).json({ message: err.message });
    }
    return next(err);
  });

  app.use((err, req, res, next) => {
    console.error("❌ Unhandled error:", err);

    const status = err?.status || 500;

    if (res.headersSent) return next(err);

    return res.status(status).json({
      message: status === 500 ? "Internal server error" : err.message || "Error",
      ...(env.nodeEnv === "production" ? {} : { stack: err.stack }),
    });
  });

  app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
  });

  return app;
}
