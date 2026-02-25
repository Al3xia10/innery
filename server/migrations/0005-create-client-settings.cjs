"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("client_settings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientUserId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      emailNotifications: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sessionReminders: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      shareReflectionsByDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      shareNotesByDefault: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      privacyMode: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "balanced",
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
    await queryInterface.dropTable("client_settings");
  },
};
