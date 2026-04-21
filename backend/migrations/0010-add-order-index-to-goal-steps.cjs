"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("goal_steps");

    if (!table.order_index) {
      await queryInterface.addColumn("goal_steps", "order_index", {
        type: Sequelize.INTEGER.UNSIGNED,
        allowNull: false,
        defaultValue: 0,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("goal_steps");
    if (table.order_index) {
      await queryInterface.removeColumn("goal_steps", "order_index");
    }
  },
};

