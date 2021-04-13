import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("ApiMessages", "mediaUrl", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      validate: {
        isUrl: true
      }
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("ApiMessages", "mediaUrl");
  }
};
