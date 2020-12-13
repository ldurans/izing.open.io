import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("StepsReplyActions", "queue"),
      queryInterface.addColumn("StepsReplyActions", "queueId", {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.removeColumn("StepsReplyActions", "userIdDestination"),
      queryInterface.addColumn("StepsReplyActions", "userIdDestination", {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "restrict",
        defaultValue: null,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("StepsReplyActions", "queueId"),
      queryInterface.addColumn("StepsReplyActions", "queue", {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true
      }),
      queryInterface.removeColumn("StepsReplyActions", "userIdDestination"),
      queryInterface.addColumn("StepsReplyActions", "userIdDestination", {
        type: DataTypes.INTEGER,
        defaultValue: null,
        allowNull: true
      })
    ]);
  }
};
