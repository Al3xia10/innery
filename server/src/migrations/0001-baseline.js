export async function up() {
  // Baseline migration: database already exists (created by sequelize.sync earlier)
  // This migration only establishes migration tracking via SequelizeMeta.
}

export async function down() {
  // No-op
}
