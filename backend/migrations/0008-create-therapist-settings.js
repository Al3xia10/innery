"use strict";

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("therapist_settings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      therapistUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      noteReminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      newClientAlerts: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      weeklySummary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
  },

  async down(queryInterface) {
    await queryInterface.dropTable("therapist_settings");
  },
};
