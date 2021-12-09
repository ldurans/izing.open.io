import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Whatsapps", "instagramUser", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      }),
      queryInterface.addColumn("Whatsapps", "instagramKey", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Whatsapps", "instagramUser"),
      queryInterface.removeColumn("Whatsapps", "instagramKey")
    ]);
  }
};
