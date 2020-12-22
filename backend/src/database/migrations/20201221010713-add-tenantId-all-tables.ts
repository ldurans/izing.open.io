import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Contacts", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Queues", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Settings", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("AutoReply", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Users", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      }),
      queryInterface.addColumn("Whatsapps", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: false,
        defaultValue: 1
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "tenantId"),
      queryInterface.removeColumn("Contacts", "tenantId"),
      queryInterface.removeColumn("Queues", "tenantId"),
      queryInterface.removeColumn("Settings", "tenantId"),
      queryInterface.removeColumn("AutoReply", "tenantId"),
      queryInterface.removeColumn("Users", "tenantId"),
      queryInterface.removeColumn("Whatsapps", "tenantId")
    ]);
  }
};
