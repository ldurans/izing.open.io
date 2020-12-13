import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("StepsReplyActions", "reply");
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("StepsReplyActions", "reply", {
      type: DataTypes.STRING,
      allowNull: true
    });
  }
};
