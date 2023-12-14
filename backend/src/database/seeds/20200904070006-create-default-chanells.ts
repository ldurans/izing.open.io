import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      `
      INSERT INTO public."Whatsapps" (id, "session", qrcode, status, battery, plugged, "createdAt", "updatedAt", "name", "isDefault", retries, "tenantId", phone, "number", "isDeleted", "tokenTelegram", "type", "instagramUser", "instagramKey", "tokenHook", "tokenAPI", "wabaBSP", "isActive", "fbPageId", "fbObject") VALUES(1, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-08-09 22:54:09.133', 'Whatsapp 01', true, 0, 1, '{}'::jsonb, '', false, NULL, 'whatsapp', NULL, NULL, '', NULL, NULL, true, NULL, NULL);
      INSERT INTO public."Whatsapps" (id, "session", qrcode, status, battery, plugged, "createdAt", "updatedAt", "name", "isDefault", retries, "tenantId", phone, "number", "isDeleted", "tokenTelegram", "type", "instagramUser", "instagramKey", "tokenHook", "tokenAPI", "wabaBSP", "isActive", "fbPageId", "fbObject") VALUES(2, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-07-19 16:19:59.332', 'Instagram 01', false, 0, 1, '{}'::jsonb, '', false, NULL, 'instagram', NULL, NULL, '', NULL, NULL, true, NULL, NULL);
      INSERT INTO public."Whatsapps" (id, "session", qrcode, status, battery, plugged, "createdAt", "updatedAt", "name", "isDefault", retries, "tenantId", phone, "number", "isDeleted", "tokenTelegram", "type", "instagramUser", "instagramKey", "tokenHook", "tokenAPI", "wabaBSP", "isActive", "fbPageId", "fbObject") VALUES(3, '', '', 'DISCONNECTED', '20', false, '2021-03-11 23:23:17.000', '2022-07-19 15:55:28.096', 'Telegram 01', false, 0, 1, '{}'::jsonb, '', false, NULL, 'telegram', NULL, NULL, '', NULL, NULL, true, NULL, NULL);
      `
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Whatsapps", {});
  }
};
