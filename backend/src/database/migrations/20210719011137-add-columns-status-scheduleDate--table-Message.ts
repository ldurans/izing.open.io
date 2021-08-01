import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Messages", "scheduleDate", {
        type: DataTypes.DATE,
        defaultValue: null
      }),
      queryInterface.addColumn("Messages", "sendType", {
        type: DataTypes.STRING,
        defaultValue: null,
        values: [
          "campaign",
          "chat",
          "external",
          "schedule",
          "web",
          "celular",
          "bot",
          "sync"
        ]
      }),
      queryInterface.addColumn("Messages", "messageId", {
        type: DataTypes.STRING,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.addColumn("Messages", "status", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null,
        values: ["pending", "sended", "received"]
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Messages", "scheduleDate"),
      queryInterface.removeColumn("Messages", "sendType"),
      queryInterface.removeColumn("Messages", "messageId"),
      queryInterface.removeColumn("Messages", "status")
    ]);
  }
};
