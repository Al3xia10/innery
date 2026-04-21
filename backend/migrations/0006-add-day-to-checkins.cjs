"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = "checkins";

    // 1) check if column exists
    const desc = await queryInterface.describeTable(table);
    if (desc.day) {
      console.log(
        "✅ Column checkins.day already exists. Skipping migration 0006.",
      );
      return;
    }

    // 2) add nullable first (so we can backfill)
    await queryInterface.addColumn(table, "day", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });

    // 3) backfill from created_at (UTC date)
    await queryInterface.sequelize.query(`
      UPDATE \`${table}\`
      SET \`day\` = DATE(\`created_at\`)
      WHERE \`day\` IS NULL
    `);

    // 4) make NOT NULL
    await queryInterface.changeColumn(table, "day", {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });

    // (optional) helpful index for queries by day
    // await queryInterface.addIndex(table, ["client_user_id", "day"]);
  },

  async down(queryInterface) {
    const table = "checkins";
    const desc = await queryInterface.describeTable(table);
    if (!desc.day) return;
    await queryInterface.removeColumn(table, "day");
  },
};
