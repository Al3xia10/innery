import { DataTypes } from "sequelize";

export function initCheckinModel(sequelize) {
  return sequelize.define(
    "Checkin",
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
      therapistId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "therapist_id",
      },
      sessionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
        field: "session_id",
      },

      type: {
        type: DataTypes.ENUM("daily", "pre_session", "post_session"),
        allowNull: false,
        defaultValue: "daily",
      },

      mood: { type: DataTypes.TINYINT.UNSIGNED, allowNull: false },
      anxiety: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true },
      energy: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true },
      sleepHours: {
        type: DataTypes.DECIMAL(4, 1),
        allowNull: true,
        field: "sleep_hours",
      },
      note: { type: DataTypes.STRING(800), allowNull: true },
    },
    {
      tableName: "checkins",
      underscored: true,
      timestamps: true,
    },
  );
}
