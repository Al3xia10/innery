import { DataTypes } from "sequelize";

export function initJournalEntryModel(sequelize) {
  return sequelize.define(
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
        validate: { notEmpty: true },
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

      // stocăm tags ca text (JSON string sau csv) — exact cum ai în DB
      tags: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "journal_entries",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["client_user_id"] },
        { fields: ["created_at"] },
        { fields: ["visibility"] },
        { fields: ["prepared_for_session"] },
      ],
    },
  );
}
