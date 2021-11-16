import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Tickets", "channel", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "whatsapp"
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([queryInterface.removeColumn("Tickets", "channel")]);
  }
};
