"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("goal_steps", {
      id: {
        type: Sequelize.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },

      goal_id: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "goals",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      title: {
        type: Sequelize.STRING(220),
        allowNull: false,
      },

      order_index: {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
      },

      done: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },

      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    await queryInterface.addIndex("goal_steps", ["goal_id", "order_index"], {
      name: "idx_goal_steps_goal_order",
    });
  },

  async down(queryInterface) {
    await queryInterface.removeIndex("goal_steps", "idx_goal_steps_goal_order");
    await queryInterface.dropTable("goal_steps");
  },
};

