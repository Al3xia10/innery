import { QueryTypes } from "sequelize";

async function hasIndex(sequelize, table, indexName) {
  const rows = await sequelize.query(
    `
    SELECT 1
    FROM information_schema.statistics
    WHERE table_schema = DATABASE()
      AND table_name = :table
      AND index_name = :indexName
    LIMIT 1
  `,
    { replacements: { table, indexName }, type: QueryTypes.SELECT },
  );
  return rows.length > 0;
}

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

export async function up({ context: qi }) {
  const sequelize = qi.sequelize;

  // Make (therapistId, userId) unique
  if (
    !(await hasConstraint(sequelize, "clients", "uq_clients_therapist_user"))
  ) {
    await qi.addConstraint("clients", {
      fields: ["therapistId", "userId"],
      type: "unique",
      name: "uq_clients_therapist_user",
    });
  }

  // Make (therapistId, email) unique (invite uniqueness)
  if (
    !(await hasConstraint(sequelize, "clients", "uq_clients_therapist_email"))
  ) {
    await qi.addConstraint("clients", {
      fields: ["therapistId", "email"],
      type: "unique",
      name: "uq_clients_therapist_email",
    });
  }

  // optional: if you still have non-unique indexes with same columns, you can keep them
  // because UNIQUE already creates an index. We'll leave as-is to avoid surprises.
}

export async function down({ context: qi }) {
  const sequelize = qi.sequelize;

  if (await hasConstraint(sequelize, "clients", "uq_clients_therapist_email")) {
    await qi.removeConstraint("clients", "uq_clients_therapist_email");
  }
  if (await hasConstraint(sequelize, "clients", "uq_clients_therapist_user")) {
    await qi.removeConstraint("clients", "uq_clients_therapist_user");
  }
}
