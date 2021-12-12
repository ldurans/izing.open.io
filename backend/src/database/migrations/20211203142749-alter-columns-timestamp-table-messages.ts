import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Messages", "timestamp", {
      type: DataTypes.BIGINT,
      allowNull: true,
      defaultValue: null
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Messages", "timestamp", {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: null
    });
  }
};
