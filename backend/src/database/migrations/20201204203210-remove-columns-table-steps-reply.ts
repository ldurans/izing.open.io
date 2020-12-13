import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("StepsReply", "action"),
      queryInterface.removeColumn("StepsReply", "stepOrder")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("StepsReply", "action", {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
      }),
      queryInterface.addColumn("StepsReply", "stepOrder", {
        type: DataTypes.INTEGER,
        allowNull: false
      })
    ]);
  }
};
