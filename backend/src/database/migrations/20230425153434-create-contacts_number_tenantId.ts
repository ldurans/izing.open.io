import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX Contacts_number_tenantId ON "Contacts" (number, "tenantId");
      `),
      // Outras alterações que você precisa executar na migração, se houver
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeIndex("Contacts", "Contacts_number_tenantId"),
      // Outras alterações de rollback que você precisa executar na migração, se houver
    ]);
  }
};