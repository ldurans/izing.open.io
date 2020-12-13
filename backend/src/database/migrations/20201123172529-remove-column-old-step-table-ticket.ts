import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Tickets", "oldStepAutoReplyId")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tickets", "oldStepAutoReplyId", {
      type: DataTypes.INTEGER,
      references: { model: "StepsReply", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
      allowNull: true,
      defaultValue: null
    });
  }
};
