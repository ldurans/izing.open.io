import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Whatsapps", "number", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Whatsapps", "phone", {
        type: DataTypes.JSONB,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Whatsapps", "number")]);
    return Promise.all([queryInterface.removeColumn("Whatsapps", "phone")]);
  }
};
