import { DataTypes } from "sequelize";

export function initGoalUpdateModel(sequelize) {
  return sequelize.define(
    "GoalUpdate",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      goalId: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "goal_id",
      },

      rating: { type: DataTypes.TINYINT.UNSIGNED, allowNull: true },
      note: { type: DataTypes.STRING(800), allowNull: true },

      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "created_at",
      },
    },
    {
      tableName: "goal_updates",
      underscored: true,
      timestamps: false, // are doar created_at
    },
  );
}
