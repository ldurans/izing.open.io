import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const tableInfo = await queryInterface.describeTable("Tenants");

    if (!tableInfo || !tableInfo["maxUsers"]) {
      await queryInterface.addColumn("Tenants", "maxUsers", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }

    if (!tableInfo || !tableInfo["maxConnections"]) {
      await queryInterface.addColumn("Tenants", "maxConnections", {
        type: DataTypes.INTEGER,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tenants", "maxUsers");
    await queryInterface.removeColumn("Tenants", "maxConnections");
  },
};
