"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("goal_steps");

    if (!table.done) {
      await queryInterface.addColumn("goal_steps", "done", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable("goal_steps");
    if (table.done) {
      await queryInterface.removeColumn("goal_steps", "done");
    }
  },
};

