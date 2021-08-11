import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Users", "configs", {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Users", "configs")]);
  }
};
