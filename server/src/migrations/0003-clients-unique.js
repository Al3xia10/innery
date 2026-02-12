"use strict";

const { QueryTypes } = require("sequelize");

async function hasConstraint(sequelize, table, name) {
  const rows = await sequelize.query(
    `
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_schema = DATABASE()
      AND table_name = :table
      AND constraint_name = :name
    LIMIT 1
  `,
    { replacements: { table, name }, type: QueryTypes.SELECT },
  );
  return rows.length > 0;
}

module.exports = {
  async up(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;

    // Make (therapistId, userId) unique
    if (
      !(await hasConstraint(sequelize, "clients", "uq_clients_therapist_user"))
    ) {
      await queryInterface.addConstraint("clients", {
        fields: ["therapistId", "userId"],
        type: "unique",
        name: "uq_clients_therapist_user",
      });
    }

    // Make (therapistId, email) unique (invite uniqueness)
    if (
      !(await hasConstraint(sequelize, "clients", "uq_clients_therapist_email"))
    ) {
      await queryInterface.addConstraint("clients", {
        fields: ["therapistId", "email"],
        type: "unique",
        name: "uq_clients_therapist_email",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const sequelize = queryInterface.sequelize;

    if (
      await hasConstraint(sequelize, "clients", "uq_clients_therapist_email")
    ) {
      await queryInterface.removeConstraint(
        "clients",
        "uq_clients_therapist_email",
      );
    }
    if (
      await hasConstraint(sequelize, "clients", "uq_clients_therapist_user")
    ) {
      await queryInterface.removeConstraint(
        "clients",
        "uq_clients_therapist_user",
      );
    }
  },
};
