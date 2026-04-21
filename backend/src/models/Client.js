import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      primaryKey: true,
      autoIncrement: true,
    },

    therapistId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },

    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING(190),
      allowNull: true,
    },

    name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM("Invited", "Active", "Paused"),
      allowNull: false,
      defaultValue: "Invited",
    },
  },
  {
    tableName: "clients",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Client;
