import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("AutoReply", "isActive", {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }),
      queryInterface.addColumn("AutoReply", "celularTeste", {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: null
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("AutoReply", "isActive"),
      queryInterface.removeColumn("AutoReply", "celularTeste")
    ]);
  }
};
