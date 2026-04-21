import { DataTypes } from "sequelize";

export default function TherapistSettingsModel(sequelize) {
  const TherapistSettings = sequelize.define(
    "TherapistSettings",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      therapistUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      emailNotifications: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      noteReminders: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      newClientAlerts: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      weeklySummary: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: "therapist_settings",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      // IMPORTANT: keep same convention as client (camelCase)
      underscored: false,
    },
  );

  TherapistSettings.associate = (models) => {
    if (models?.User) {
      TherapistSettings.belongsTo(models.User, {
        foreignKey: "therapistUserId",
        targetKey: "id",
        as: "therapistUser",
      });
    }
  };

  return TherapistSettings;
}
