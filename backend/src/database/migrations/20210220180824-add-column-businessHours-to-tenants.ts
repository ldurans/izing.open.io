import { QueryInterface, DataTypes } from "sequelize";
import { BusinessHours } from "../../utils/defaultConstants";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("Tenants", "businessHours", {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: BusinessHours
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Tenants", "businessHours");
  }
};
