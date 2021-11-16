import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Whatsapps", "type", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "whatsapp"
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.changeColumn("Whatsapps", "type", {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "w"
    });
  }
};
