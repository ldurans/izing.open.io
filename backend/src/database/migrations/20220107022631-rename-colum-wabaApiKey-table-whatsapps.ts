import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("Whatsapps", "wabaApiKey", "tokenAPI")
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.renameColumn("Whatsapps", "tokenAPI", "wabaApiKey")
    ]);
  }
};
