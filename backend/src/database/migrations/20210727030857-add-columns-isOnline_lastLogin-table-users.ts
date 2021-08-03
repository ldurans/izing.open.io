import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "lastLogin", {
        type: DataTypes.DATE,
        defaultValue: null
      }),
      queryInterface.addColumn("Users", "lastLogout", {
        type: DataTypes.DATE,
        defaultValue: null
      }),
      queryInterface.addColumn("Users", "isOnline", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "lastLogin"),
      queryInterface.removeColumn("Users", "lastLogout"),
      queryInterface.removeColumn("Users", "isOnline")
    ]);
  }
};
