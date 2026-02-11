import { sequelize } from "../config/db.js";
import { initUserModel } from "./User.js";
import Client from "./Client.js";
import { initSessionModel } from "./Session.js";
import { initNoteModel } from "./Note.js";

export const models = {};

models.User = initUserModel(sequelize);
models.Client = Client;
models.Session = initSessionModel(sequelize);
models.Note = initNoteModel(sequelize);
// Associations
// Un terapeut (User) are mai mulți clienți (Client rows)
models.User.hasMany(models.Client, {
  foreignKey: "therapistId",
  as: "clients",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Un client row aparține terapeutului (User)
models.Client.belongsTo(models.User, {
  foreignKey: "therapistId",
  as: "therapist",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Un client row aparține user-ului client (User)
models.Client.belongsTo(models.User, {
  foreignKey: "userId",
  as: "user",
  onDelete: "SET NULL",
  onUpdate: "CASCADE",
});

// Sessions associations
// Therapist (User) -> many Sessions
models.User.hasMany(models.Session, {
  foreignKey: "therapistId",
  as: "therapistSessions",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

models.Session.belongsTo(models.User, {
  foreignKey: "therapistId",
  as: "therapist",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// Client user (User cu role client) -> many Sessions
models.User.hasMany(models.Session, {
  foreignKey: "clientUserId",
  as: "clientSessions",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

models.Session.belongsTo(models.User, {
  foreignKey: "clientUserId",
  as: "clientUser",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

// Notes associations
// Session -> many Notes (no naming collision now; Session uses `notesPreview`)
models.Session.hasMany(models.Note, {
  foreignKey: "sessionId",
  as: "notes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

models.Note.belongsTo(models.Session, {
  foreignKey: "sessionId",
  as: "session",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

models.User.hasMany(models.Note, {
  foreignKey: "therapistId",
  as: "therapistNotes",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

models.Note.belongsTo(models.User, {
  foreignKey: "therapistId",
  as: "therapist",
  onDelete: "CASCADE",
  onUpdate: "CASCADE",
});

// aici adăugăm și celelalte modele imediat (Client, Session, Note, Reflection)

export { sequelize };
