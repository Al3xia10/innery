"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // CHECKINS (mood)
    await queryInterface.createTable("checkins", {
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

      therapist_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      session_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      type: {
        type: Sequelize.ENUM("daily", "pre_session", "post_session"),
        allowNull: false,
        defaultValue: "daily",
      },

      mood: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: false,
      },

      anxiety: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },

      energy: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },

      sleep_hours: {
        type: Sequelize.DECIMAL(4, 1),
        allowNull: true,
      },

      note: {
        type: Sequelize.STRING(800),
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

    await queryInterface.addConstraint("checkins", {
      fields: ["client_user_id"],
      type: "foreign key",
      name: "fk_checkins_client_user",
      references: { table: "users", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("checkins", {
      fields: ["therapist_id"],
      type: "foreign key",
      name: "fk_checkins_therapist",
      references: { table: "users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("checkins", {
      fields: ["session_id"],
      type: "foreign key",
      name: "fk_checkins_session",
      references: { table: "sessions", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addIndex("checkins", ["client_user_id"], {
      name: "idx_checkins_client",
    });

    await queryInterface.addIndex("checkins", ["therapist_id"], {
      name: "idx_checkins_therapist",
    });

    await queryInterface.addIndex("checkins", ["created_at"], {
      name: "idx_checkins_created_at",
    });

    // GOALS
    await queryInterface.createTable("goals", {
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

      therapist_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: true,
      },

      title: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },

      status: {
        type: Sequelize.ENUM("active", "paused", "done"),
        allowNull: false,
        defaultValue: "active",
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

    await queryInterface.addConstraint("goals", {
      fields: ["client_user_id"],
      type: "foreign key",
      name: "fk_goals_client_user",
      references: { table: "users", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addConstraint("goals", {
      fields: ["therapist_id"],
      type: "foreign key",
      name: "fk_goals_therapist",
      references: { table: "users", field: "id" },
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    await queryInterface.addIndex("goals", ["client_user_id"], {
      name: "idx_goals_client",
    });

    await queryInterface.addIndex("goals", ["status"], {
      name: "idx_goals_status",
    });

    // GOAL UPDATES
    await queryInterface.createTable("goal_updates", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },

      goal_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      rating: {
        type: Sequelize.TINYINT.UNSIGNED,
        allowNull: true,
      },

      note: {
        type: Sequelize.STRING(800),
        allowNull: true,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addConstraint("goal_updates", {
      fields: ["goal_id"],
      type: "foreign key",
      name: "fk_goal_updates_goal",
      references: { table: "goals", field: "id" },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    await queryInterface.addIndex("goal_updates", ["goal_id"], {
      name: "idx_goal_updates_goal",
    });

    await queryInterface.addIndex("goal_updates", ["created_at"], {
      name: "idx_goal_updates_created_at",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("goal_updates");
    await queryInterface.dropTable("goals");
    await queryInterface.dropTable("checkins");
  },
};
