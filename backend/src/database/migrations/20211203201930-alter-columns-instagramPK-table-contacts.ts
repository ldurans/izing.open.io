import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Contacts", "instagramPK", {
        type: DataTypes.BIGINT,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.changeColumn("Contacts", "instagramPK", {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null
      })
    ]);
  }
};
