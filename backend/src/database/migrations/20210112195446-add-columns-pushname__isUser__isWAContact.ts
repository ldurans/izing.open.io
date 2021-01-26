import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Contacts", "pushname", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Contacts", "isUser", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Contacts", "isWAContact", {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Contacts", "pushname"),
      queryInterface.removeColumn("Contacts", "isUser"),
      queryInterface.removeColumn("Contacts", "isWAContact")
    ]);
  }
};
