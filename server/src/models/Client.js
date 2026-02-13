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

    // Linked client (when the client has an account)
    userId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: true,
    },

    // Used only for invited clients (pending)
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
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  },
);

export default Client;
