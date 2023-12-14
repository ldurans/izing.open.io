import { QueryInterface, QueryTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // Obtém a lista de tenants existentes no banco de dados
    const tenants = await queryInterface.sequelize.query(
      'SELECT id FROM "Tenants"',
      { type: QueryTypes.SELECT }
    );
    
    const settingId:any = await queryInterface.sequelize.query(
      'select max(id) mId from "Settings"',
      { type: QueryTypes.SELECT }
    );

    // Loop pelos tenants e insere as novas configurações para cada um
    await Promise.all(
      tenants.map(async (tenant: any, idx) => {
        const { id } = tenant;
        const newSettings = [
          {
            key: "newTicketTransference",
            value: "disabled",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            key: "rejectCalls",
            value: "disabled",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          },
          {
            key: "callRejectMessage",
            value:
              "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.",
            tenantId: id,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]

        const bulk = newSettings.map((s, i) => {
          return {
            ...s,
            id: settingId[0].mid + idx + 1 + i,
          }
        })

        // Insere as novas configurações para o tenant
        await queryInterface.bulkInsert("Settings", bulk);
      })
    );
  },

  down: async (queryInterface: QueryInterface) => {
    // Remove as configurações inseridas para cada tenant
    await queryInterface.sequelize.query('SELECT id FROM "Tenants"', {
      type: QueryTypes.SELECT
    });
  }
};
