import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Contacts", "telegramId", {
        type: DataTypes.BIGINT,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.removeConstraint(
        "Contacts",
        "unique_constraint_contact_number_tenant"
      ),
      queryInterface.changeColumn("Contacts", "number", {
        type: DataTypes.STRING,
        allowNull: true,
        unique: false,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Contacts", "telegramId"),
      queryInterface.changeColumn("Contacts", "number", {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      }),
      queryInterface.addConstraint("Contacts", ["number", "tenantId"], {
        type: "unique",
        name: "unique_constraint_contact_number_tenant"
      })
    ]);
  }
};
