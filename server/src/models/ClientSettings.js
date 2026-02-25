import { DataTypes } from "sequelize";

export default function ClientSettingsModel(sequelize) {
  const ClientSettings = sequelize.define(
    "ClientSettings",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      emailNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sessionReminders: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      shareReflectionsByDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      shareNotesByDefault: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      privacyMode: {
        // In DB it is varchar, not ENUM (per your column dump)
        type: DataTypes.STRING(32),
        allowNull: false,
        defaultValue: "balanced",
        validate: {
          isIn: [["balanced", "private", "open"]],
        },
      },
    },
    {
      tableName: "client_settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      // IMPORTANT: your columns are camelCase (NOT underscored)
      underscored: false,
    },
  );

  // Optional association (safe even if unused)
  ClientSettings.associate = (models) => {
    if (models?.User) {
      ClientSettings.belongsTo(models.User, {
        foreignKey: "clientUserId",
        targetKey: "id",
        as: "clientUser",
      });
    }
  };

  return ClientSettings;
}
