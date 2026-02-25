import express from "express";
import { Op, DataTypes } from "sequelize";

import * as auth from "../middleware/auth.js";
import { sequelize, models } from "../models/index.js";

// --- Helpers ---------------------------------------------------------------

function pickAuthMiddleware() {
  // Support both named exports and default export.
  const requireAuth =
    auth.requireAuth ||
    auth.authRequired ||
    auth.requireUser ||
    auth.authenticate ||
    auth.default ||
    null;

  const requireRole = auth.requireRole || auth.requireUserRole || null;

  if (typeof requireAuth !== "function") {
    // If auth middleware is mounted globally in app.js, this can still work.
    return {
      requireAuth: (req, _res, next) => next(),
      requireClient: (req, res, next) => {
        if (!req.user) return res.status(401).json({ message: "Unauthorized" });
        if (req.user.role !== "client")
          return res.status(403).json({ message: "Forbidden" });
        next();
      },
    };
  }

  const requireClient =
    typeof requireRole === "function"
      ? requireRole("client")
      : (req, res, next) => {
          if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
          if (req.user.role !== "client")
            return res.status(403).json({ message: "Forbidden" });
          next();
        };

  return { requireAuth, requireClient };
}

function parseTags(input) {
  if (!input) return [];
  if (Array.isArray(input))
    return input
      .map(String)
      .map((t) => t.trim())
      .filter(Boolean);
  if (typeof input === "string") {
    // allow: "somn, panică" or JSON array
    const raw = input.trim();
    if (!raw) return [];
    if (raw.startsWith("[") && raw.endsWith("]")) {
      try {
        const arr = JSON.parse(raw);
        return Array.isArray(arr)
          ? arr
              .map(String)
              .map((t) => t.trim())
              .filter(Boolean)
          : [];
      } catch {
        return raw
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      }
    }
    return raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  return [];
}

function toPublicEntry(row) {
  if (!row) return null;

  // tags are stored as JSON string in DB; parse best-effort
  let tags = [];
  try {
    const raw = row.tags;
    if (typeof raw === "string" && raw.trim().startsWith("["))
      tags = JSON.parse(raw);
    else if (typeof raw === "string")
      tags = raw
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
  } catch {
    tags = [];
  }

  return {
    id: row.id,
    clientUserId: row.clientUserId,
    title: row.title ?? "",
    content: row.content,
    visibility: row.visibility,
    preparedForSession: Boolean(row.preparedForSession),
    preparedAt: row.preparedAt ?? null,
    tags,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// --- Model (fallback defined here) -----------------------------------------
// IMPORTANT: This expects you have a `journal_entries` table created by migrations.
// If the table doesn't exist yet, these endpoints will error only when called.
const JournalEntry =
  models.JournalEntry ||
  sequelize.define(
    "JournalEntry",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      clientUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "client_user_id",
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      visibility: {
        type: DataTypes.ENUM("private", "shared"),
        allowNull: false,
        defaultValue: "private",
      },
      preparedForSession: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "prepared_for_session",
      },
      preparedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: "prepared_at",
      },
      tags: {
        // JSON string (easier cross-mysql)
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "journal_entries",
      underscored: true,
      timestamps: true,
    },
  );

// --- Router ----------------------------------------------------------------

const router = express.Router();
const { requireAuth, requireClient } = pickAuthMiddleware();

// All client journal endpoints are authenticated.
router.use(requireAuth);
router.use(requireClient);

/**
 * NOTE ABOUT PATHS:
 * This router is mounted like:
 *   app.use('/api/client', router)
 * So routes below use '/journal...' so the final URLs are:
 *   /api/client/journal
 *   /api/client/journal/:id
 */

// GET /api/client/journal
// Query:
//  - q: full-text-ish search in title/content
//  - tag: filter by a tag (single)
//  - visibility: private|shared
//  - prepared: 1|0
//  - limit, offset
router.get("/journal", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);
    const q = String(req.query.q ?? "").trim();
    const tag = String(req.query.tag ?? "").trim();
    const visibility = String(req.query.visibility ?? "").trim();
    const prepared = req.query.prepared;

    const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 20)));
    const offset = Math.max(0, Number(req.query.offset ?? 0));

    const where = { clientUserId };

    if (visibility === "private" || visibility === "shared") {
      // @ts-ignore
      where.visibility = visibility;
    }

    if (prepared === "1" || prepared === "0") {
      // @ts-ignore
      where.preparedForSession = prepared === "1";
    }

    if (q) {
      // @ts-ignore
      where[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { content: { [Op.like]: `%${q}%` } },
      ];
    }

    if (tag) {
      const clean = tag.replace(/"/g, "");
      const esc = clean.replace(/%/g, "\\%").replace(/_/g, "\\_");

      // tags stored either as JSON string (e.g. ["somn","panică"]) or CSV-like string
      // @ts-ignore
      where.tags = {
        [Op.or]: [{ [Op.like]: `%"${clean}"%` }, { [Op.like]: `%${esc}%` }],
      };
    }

    const { rows, count } = await JournalEntry.findAndCountAll({
      where,
      order: [["updatedAt", "DESC"]],
      limit,
      offset,
    });

    return res.json({
      entries: rows.map(toPublicEntry),
      page: { limit, offset, total: count },
    });
  } catch (e) {
    console.error("client.journal GET error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// GET /api/client/journal/:id
router.get("/journal/:id", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);
    const id = Number(req.params.id);

    const row = await JournalEntry.findOne({ where: { id, clientUserId } });
    if (!row) return res.status(404).json({ message: "Not found" });

    return res.json({ entry: toPublicEntry(row) });
  } catch (e) {
    console.error("client.journal GET/:id error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/client/journal
router.post("/journal", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);

    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : "";
    const content =
      typeof req.body?.content === "string" ? req.body.content.trim() : "";
    const visibility = req.body?.visibility === "shared" ? "shared" : "private";
    const tagsArr = parseTags(req.body?.tags);

    if (!content)
      return res.status(400).json({ message: "Content is required" });

    const created = await JournalEntry.create({
      clientUserId,
      title: title || null,
      content,
      visibility,
      tags: tagsArr.length ? JSON.stringify(tagsArr) : null,
    });

    return res.status(201).json({ entry: toPublicEntry(created) });
  } catch (e) {
    console.error("client.journal POST error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/client/journal/:id
router.put("/journal/:id", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);
    const id = Number(req.params.id);

    const row = await JournalEntry.findOne({ where: { id, clientUserId } });
    if (!row) return res.status(404).json({ message: "Not found" });

    const title =
      typeof req.body?.title === "string" ? req.body.title.trim() : undefined;
    const content =
      typeof req.body?.content === "string"
        ? req.body.content.trim()
        : undefined;
    const visibility = req.body?.visibility;
    const tags = req.body?.tags;

    const patch = {};
    if (title !== undefined) patch.title = title || null;
    if (content !== undefined) patch.content = content;
    if (visibility === "private" || visibility === "shared")
      patch.visibility = visibility;
    if (tags !== undefined) {
      const tagsArr = parseTags(tags);
      patch.tags = tagsArr.length ? JSON.stringify(tagsArr) : null;
    }

    if (patch.content !== undefined && !String(patch.content).trim()) {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    await row.update(patch);
    return res.json({ entry: toPublicEntry(row) });
  } catch (e) {
    console.error("client.journal PUT/:id error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/client/journal/:id
router.delete("/journal/:id", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);
    const id = Number(req.params.id);

    const row = await JournalEntry.findOne({ where: { id, clientUserId } });
    if (!row) return res.status(404).json({ message: "Not found" });

    await row.destroy();
    return res.json({ ok: true });
  } catch (e) {
    console.error("client.journal DELETE/:id error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

// POST /api/client/journal/:id/prepare
// Toggles "prepared for session" (used by UI: "Pregătește pentru ședință")
router.post("/journal/:id/prepare", async (req, res) => {
  try {
    const clientUserId = Number(req.user?.id);
    const id = Number(req.params.id);

    const row = await JournalEntry.findOne({ where: { id, clientUserId } });
    if (!row) return res.status(404).json({ message: "Not found" });

    const next = !Boolean(row.preparedForSession);
    await row.update({
      preparedForSession: next,
      preparedAt: next ? new Date() : null,
    });

    return res.json({ entry: toPublicEntry(row) });
  } catch (e) {
    console.error("client.journal POST/:id/prepare error:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
