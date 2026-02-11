import { DataTypes } from "sequelize";

export function initUserModel(sequelize) {
  const User = sequelize.define(
    "User",
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
      },

      role: {
        type: DataTypes.ENUM("therapist", "client"),
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING(190),
        allowNull: false,
        unique: true,
        validate: { isEmail: true },
      },

      passwordHash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      tableName: "users",
      underscored: true,
      timestamps: true,
    },
  );

  return User;
}
