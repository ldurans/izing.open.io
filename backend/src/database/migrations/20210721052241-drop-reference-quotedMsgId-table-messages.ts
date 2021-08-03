import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    /// caso apresente erro, será necessário rodar direto no banco
    // após rodar manualmente, inserir a migration na tabela de metadados do sequelize
    return Promise.all([
      queryInterface.sequelize.query(
        'ALTER TABLE public."Messages" DROP CONSTRAINT "Messages_quotedMsgId_fkey";'
      )
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.sequelize.query(
        'ALTER TABLE public."Messages" ADD CONSTRAINT "Messages_quotedMsgId_fkey" FOREIGN KEY ("quotedMsgId") REFERENCES "Messages"(id) ON UPDATE CASCADE ON DELETE SET NULL;'
      )
    ]);
  }
};
