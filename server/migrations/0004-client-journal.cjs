"use strict";

/**
 * 0004-client-journal.cjs
 * Creează tabela `journal_entries` pentru Journal (client).
 *
 * Coloane:
 * - client_user_id (users.id)
 * - visibility: private/shared
 * - prepared_for_session + prepared_at
 * - tags: TEXT (JSON string)
 * - created_at / updated_at (snake_case)
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("journal_entries", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      client_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      title: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },

      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },

      visibility: {
        type: Sequelize.ENUM("private", "shared"),
        allowNull: false,
        defaultValue: "private",
      },

      prepared_for_session: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      prepared_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },

      tags: {
        // JSON string (ex: '["somn","panică"]')
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Indexes pentru query-uri rapide
    await queryInterface.addIndex("journal_entries", ["client_user_id"], {
      name: "idx_journal_entries_client_user_id",
    });

    await queryInterface.addIndex("journal_entries", ["created_at"], {
      name: "idx_journal_entries_created_at",
    });

    await queryInterface.addIndex(
      "journal_entries",
      ["client_user_id", "created_at"],
      {
        name: "idx_journal_entries_client_user_id_created_at",
      },
    );

    await queryInterface.addIndex(
      "journal_entries",
      ["client_user_id", "prepared_for_session"],
      {
        name: "idx_journal_entries_client_user_id_prepared",
      },
    );

    await queryInterface.addIndex(
      "journal_entries",
      ["client_user_id", "visibility"],
      {
        name: "idx_journal_entries_client_user_id_visibility",
      },
    );
  },

  async down(queryInterface, Sequelize) {
    // întâi ștergem ENUM-ul (MySQL ține enum-ul în schema coloanei)
    await queryInterface.dropTable("journal_entries");

    // Cleanup best-effort pentru ENUM (Sequelize poate crea tipuri în unele dialecte)
    // La MySQL nu există DROP TYPE pentru ENUM, deci nu facem nimic aici.
  },
};
