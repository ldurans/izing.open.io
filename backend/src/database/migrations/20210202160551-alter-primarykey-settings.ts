import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Settings", "key", {
        type: DataTypes.STRING,
        primaryKey: false,
        allowNull: false,
        unique: false
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Settings", "key", {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        unique: true
      })
    ]);
  }
};
