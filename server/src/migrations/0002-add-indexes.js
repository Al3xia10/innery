"use strict";

const { QueryTypes } = require("sequelize");

async function getColumns(sequelize, table) {
  const rows = await sequelize.query(
    `
    SELECT column_name AS name
    FROM information_schema.columns
    WHERE table_schema = DATABASE()
      AND table_name = :table
  `,
    { replacements: { table }, type: QueryTypes.SELECT },
  );
  return new Set(rows.map((r) => r.name));
}

async function hasIndex(sequelize, table, indexName) {
  const rows = await sequelize.query(
    `
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = :table
      AND index_name = :indexName
    LIMIT 1
  `,
    { replacements: { table, indexName }, type: QueryTypes.SELECT },
  );
  return rows.length > 0;
}

function pick(cols, candidates) {
  for (const c of candidates) if (cols.has(c)) return c;
  return null;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;

    // ---- CLIENTS ----
    const clientsCols = await getColumns(sequelize, "clients");
    const cTherapist = pick(clientsCols, ["therapist_id", "therapistId"]);
    const cUser = pick(clientsCols, ["user_id", "userId"]);
    const cEmail = pick(clientsCols, ["email"]);

    if (
      cTherapist &&
      cUser &&
      !(await hasIndex(sequelize, "clients", "clients_therapist_user"))
    ) {
      await queryInterface.addIndex("clients", [cTherapist, cUser], {
        name: "clients_therapist_user",
      });
    }

    if (
      cTherapist &&
      cEmail &&
      !(await hasIndex(sequelize, "clients", "clients_therapist_email"))
    ) {
      await queryInterface.addIndex("clients", [cTherapist, cEmail], {
        name: "clients_therapist_email",
      });
    }

    // ---- SESSIONS ----
    const sessionsCols = await getColumns(sequelize, "sessions");
    const sTherapist = pick(sessionsCols, ["therapist_id", "therapistId"]);
    const sDate = pick(sessionsCols, ["scheduled_at", "startsAt", "starts_at"]);

    if (
      sTherapist &&
      sDate &&
      !(await hasIndex(sequelize, "sessions", "sessions_therapist_date"))
    ) {
      await queryInterface.addIndex("sessions", [sTherapist, sDate], {
        name: "sessions_therapist_date",
      });
    }

    // ---- NOTES ----
    const notesCols = await getColumns(sequelize, "notes");
    const nSession = pick(notesCols, ["session_id", "sessionId"]);
    const nCreated = pick(notesCols, ["created_at", "createdAt"]);

    if (
      nSession &&
      nCreated &&
      !(await hasIndex(sequelize, "notes", "notes_session_created"))
    ) {
      await queryInterface.addIndex("notes", [nSession, nCreated], {
        name: "notes_session_created",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;

    const dropIfExists = async (table, name) => {
      if (await hasIndex(sequelize, table, name)) {
        await queryInterface.removeIndex(table, name);
      }
    };

    await dropIfExists("notes", "notes_session_created");
    await dropIfExists("sessions", "sessions_therapist_date");
    await dropIfExists("clients", "clients_therapist_email");
    await dropIfExists("clients", "clients_therapist_user");
  },
};
