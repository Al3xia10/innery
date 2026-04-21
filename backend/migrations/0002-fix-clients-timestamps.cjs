"use strict";

module.exports = {
  async up(queryInterface) {
    const t = await queryInterface.describeTable("clients");

    if (t.createdAt && !t.created_at) {
      await queryInterface.renameColumn("clients", "createdAt", "created_at");
    }
    if (t.updatedAt && !t.updated_at) {
      await queryInterface.renameColumn("clients", "updatedAt", "updated_at");
    }
  },

  async down(queryInterface) {
    const t = await queryInterface.describeTable("clients");

    if (t.created_at && !t.createdAt) {
      await queryInterface.renameColumn("clients", "created_at", "createdAt");
    }
    if (t.updated_at && !t.updatedAt) {
      await queryInterface.renameColumn("clients", "updated_at", "updatedAt");
    }
  },
};
