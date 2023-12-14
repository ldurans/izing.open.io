import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.addColumn("Whatsapps", "farewellMessage", {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      });
    } catch (error) {
      console.error(
        "Não foi possível adicionar coluna farewellMessage. Verifique se ela está presente no banco. ",
        error
      );
    }
  },

  down: async (queryInterface: QueryInterface) => {
    try {
      await queryInterface.removeColumn("Whatsapps", "farewellMessage");
    } catch (error) {
      console.error(
        "Não foi deletar coluna farewellMessage. Verifique se ela está presente no banco. ",
        error
      );
    }
  }
};
