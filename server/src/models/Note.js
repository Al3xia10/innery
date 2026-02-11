import { DataTypes } from "sequelize";

export function initNoteModel(sequelize) {
  const Note = sequelize.define(
    "Note",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      sessionId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "session_id",
      },

      therapistId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "therapist_id",
      },

      content: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      tableName: "notes",
      underscored: true,
      timestamps: true,
      indexes: [
        { fields: ["session_id"] },
        { fields: ["therapist_id"] },
        { fields: ["session_id", "therapist_id"] },
        { fields: ["created_at"] },
      ],
    },
  );

  return Note;
}
