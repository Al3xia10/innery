import { DataTypes } from "sequelize";

export function initGoalStepModel(sequelize) {
  return sequelize.define(
    "GoalStep",
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

      title: {
        type: DataTypes.STRING(220),
        allowNull: false,
      },

      orderIndex: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        field: "order_index",
      },

      done: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
    },
    {
      tableName: "goal_steps",
      underscored: true,
      timestamps: true,
    },
  );
}

