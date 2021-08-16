import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "answered", {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Tickets", "answered")]);
  }
};
