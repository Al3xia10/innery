"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Baseline migration.
    // Intentionally empty because tables are created by later migrations
    // or were previously created during development.
  },

  async down(queryInterface, Sequelize) {
    // No rollback needed for baseline.
  },
};
