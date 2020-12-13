import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("StepsReplyActions", "nextStep", {
      type: DataTypes.INTEGER,
      references: { model: "StepsReply", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      defaultValue: null,
      allowNull: true
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("StepsReplyActions", "nextStep");
  }
};
