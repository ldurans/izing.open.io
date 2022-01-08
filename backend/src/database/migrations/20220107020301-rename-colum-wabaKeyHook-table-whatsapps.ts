import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("Whatsapps", "wabaKeyHook", "tokenHook")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("Whatsapps", "tokenHook", "wabaKeyHook")
    ]);
  }
};
