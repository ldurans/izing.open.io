import { QueryInterface, DataTypes } from "sequelize";
import { messageBusinessHours } from "../../utils/defaultConstants";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tenants", "messageBusinessHours", {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: messageBusinessHours
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tenants", "messageBusinessHours");
  }
};
