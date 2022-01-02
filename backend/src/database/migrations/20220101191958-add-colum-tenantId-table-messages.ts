import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Messages", "tenantId", {
        type: DataTypes.INTEGER,
        references: { model: "Tenants", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Messages", "tenantId")]);
  }
};
