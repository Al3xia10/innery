"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // USERS
    await queryInterface.createTable("users", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: Sequelize.ENUM("therapist", "client"),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(190),
        allowNull: false,
        unique: true,
      },
      password_hash: {
        type: Sequelize.STRING(255),
        allowNull: false,
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

    // CLIENTS
    await queryInterface.createTable("clients", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      therapistId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING(190),
        allowNull: true,
      },
      name: {
        type: Sequelize.STRING(120),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("Invited", "Active", "Paused"),
        allowNull: false,
        defaultValue: "Invited",
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

    await queryInterface.addConstraint("clients", {
      fields: ["therapistId"],
      type: "foreign key",
      name: "fk_clients_therapist",
      references: { table: "users", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("clients", {
      fields: ["userId"],
      type: "foreign key",
      name: "fk_clients_user",
      references: { table: "users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    // Unique constraints (MySQL allows multiple NULLs -> ok for userId/email)
    await queryInterface.addConstraint("clients", {
      fields: ["therapistId", "userId"],
      type: "unique",
      name: "uq_clients_therapist_user",
    });

    await queryInterface.addConstraint("clients", {
      fields: ["therapistId", "email"],
      type: "unique",
      name: "uq_clients_therapist_email",
    });

    await queryInterface.addIndex("clients", ["therapistId"], {
      name: "idx_clients_therapist",
    });
    await queryInterface.addIndex("clients", ["userId"], {
      name: "idx_clients_user",
    });
    await queryInterface.addIndex("clients", ["email"], {
      name: "idx_clients_email",
    });

    // SESSIONS
    await queryInterface.createTable("sessions", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      therapist_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      client_user_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      duration_min: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 50,
      },
      status: {
        type: Sequelize.ENUM("Scheduled", "Completed", "Canceled", "NoShow"),
        allowNull: false,
        defaultValue: "Scheduled",
      },
      notes_preview: {
        type: Sequelize.STRING(500),
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

    await queryInterface.addConstraint("sessions", {
      fields: ["therapist_id"],
      type: "foreign key",
      name: "fk_sessions_therapist",
      references: { table: "users", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("sessions", {
      fields: ["client_user_id"],
      type: "foreign key",
      name: "fk_sessions_client_user",
      references: { table: "users", field: "id" },
      onDelete: "RESTRICT",
      onUpdate: "CASCADE",
    });

    await queryInterface.addIndex("sessions", ["therapist_id"], {
      name: "idx_sessions_therapist",
    });
    await queryInterface.addIndex("sessions", ["client_user_id"], {
      name: "idx_sessions_client_user",
    });
    await queryInterface.addIndex("sessions", ["scheduled_at"], {
      name: "idx_sessions_scheduled_at",
    });
    await queryInterface.addIndex(
      "sessions",
      ["therapist_id", "scheduled_at"],
      { name: "idx_sessions_therapist_date" },
    );

    // NOTES
    await queryInterface.createTable("notes", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      session_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      therapist_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
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

    await queryInterface.addConstraint("notes", {
      fields: ["session_id"],
      type: "foreign key",
      name: "fk_notes_session",
      references: { table: "sessions", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("notes", {
      fields: ["therapist_id"],
      type: "foreign key",
      name: "fk_notes_therapist",
      references: { table: "users", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addIndex("notes", ["session_id"], {
      name: "idx_notes_session",
    });
    await queryInterface.addIndex("notes", ["therapist_id"], {
      name: "idx_notes_therapist",
    });
    await queryInterface.addIndex("notes", ["session_id", "therapist_id"], {
      name: "idx_notes_session_therapist",
    });
    await queryInterface.addIndex("notes", ["created_at"], {
      name: "idx_notes_created_at",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("notes");
    await queryInterface.dropTable("sessions");
    await queryInterface.dropTable("clients");
    await queryInterface.dropTable("users");
  },
};
