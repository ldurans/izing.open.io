import { QueryTypes } from "sequelize";
import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";

const SyncContactsWhatsappInstanceService = async (
  whatsappId: number,
  tenantId: number
): Promise<void> => {
  const wbot = getWbot(whatsappId);

  let contacts;

  try {
    contacts = await wbot.getContacts();
  } catch (err) {
    logger.error(
      `Could not get whatsapp contacts from phone. Check connection page. | Error: ${err}`
    );
  }

  if (!contacts) {
    throw new AppError("ERR_CONTACTS_NOT_EXISTS_WHATSAPP", 404);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const dataArray: object[] = [];
    await Promise.all(
      contacts.map(async ({ name, pushname, number, isGroup }) => {
        if ((name || pushname) && !isGroup) {
          // const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);
          const contactObj = { name: name || pushname, number, tenantId };
          dataArray.push(contactObj);
        }
      })
    );
    if (dataArray.length) {
      const d = new Date().toJSON();
      const query = `INSERT INTO "Contacts" (number, name, "tenantId", "createdAt", "updatedAt") VALUES
        ${dataArray
          .map((e: any) => {
            return `('${e.number}',
            '${e.name}',
            '${e.tenantId}',
            '${d}'::timestamp,
            '${d}'::timestamp)`;
          })
          .join(",")}
        ON CONFLICT (number, "tenantId") DO NOTHING`;

      await Contact.sequelize?.query(query, {
        type: QueryTypes.INSERT
      });
      // await Contact.bulkCreate(dataArray, {
      //   fields: ["number", "name", "tenantId"],
      //   updateOnDuplicate: ["number", "name"],
      //   logging: console.log
      // });
      // console.log("sql contact");
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default SyncContactsWhatsappInstanceService;
