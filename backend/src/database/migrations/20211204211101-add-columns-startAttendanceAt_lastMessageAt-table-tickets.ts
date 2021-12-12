import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "lastMessageAt", {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Tickets", "startedAttendanceAt", {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Tickets", "closedAt", {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "lastMessageAt"),
      queryInterface.removeColumn("Tickets", "startedAttendanceAt"),
      queryInterface.removeColumn("Tickets", "closedAt")
    ]);
  }
};
