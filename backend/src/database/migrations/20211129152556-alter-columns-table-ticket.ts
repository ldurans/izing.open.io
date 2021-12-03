import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "chatFlowId", {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "stepChatFlow", {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.addColumn("Tickets", "closedAt", {
        type: DataTypes.DATE,
        defaultValue: null,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "chatFlowId"),
      queryInterface.removeColumn("Tickets", "stepChatFlow"),
      queryInterface.removeColumn("Tickets", "closedAt")
    ]);
  }
};
