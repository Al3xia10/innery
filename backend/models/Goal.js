import { DataTypes } from "sequelize";

export function initGoalModel(sequelize) {
  return sequelize.define(
    "Goal",
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

      title: { type: DataTypes.STRING(200), allowNull: false },

      status: {
        type: DataTypes.ENUM("active", "paused", "done"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "goals",
      underscored: true,
      timestamps: true,
    },
  );
}
