import { DataTypes } from "sequelize";

export function initSessionModel(sequelize) {
  const Session = sequelize.define(
    "Session",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      therapistId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "therapist_id",
      },

      clientUserId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "client_user_id",
      },

      startsAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "scheduled_at",
      },

      durationMin: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 50,
        field: "duration_min",
      },

      status: {
        type: DataTypes.ENUM("Scheduled", "Completed", "Canceled", "NoShow"),
        allowNull: false,
        defaultValue: "Scheduled",
      },

      notesPreview: {
        type: DataTypes.STRING(500),
        allowNull: true,
        field: "notes_preview",
      },
    },
    {
      tableName: "sessions",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["therapist_id"] },
        { fields: ["client_user_id"] },
        { fields: ["scheduled_at"] },
      ],
    },
  );

  return Session;
}
