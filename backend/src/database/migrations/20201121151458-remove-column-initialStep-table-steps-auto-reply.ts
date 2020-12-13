import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("StepsReply", "initialStep")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("StepsReply", "initialStep", {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      })
    ]);
  }
};
