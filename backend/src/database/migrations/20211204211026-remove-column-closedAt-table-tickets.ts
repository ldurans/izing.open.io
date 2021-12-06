import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Tickets", "closedAt")]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "closedAt", {
        type: DataTypes.DATE(),
        allowNull: true,
        defaultValue: null
      })
    ]);
  }
};
