import { DataTypes } from "sequelize";

export function initExerciseModel(sequelize) {
  return sequelize.define(
    "Exercise",
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

      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
      },

      kind: {
        type: DataTypes.ENUM("Exercițiu", "Rutină", "Experiment"),
        allowNull: false,
        defaultValue: "Exercițiu",
      },

      minutes: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: true,
      },

      note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "exercises",
      underscored: true,
      timestamps: true,
    },
  );
}
