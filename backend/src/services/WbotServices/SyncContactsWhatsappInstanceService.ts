import { getWbot } from "../../libs/wbot";
import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

const SyncContactsWhatsappInstanceService = async (
  whatsappId: number
): Promise<void> => {
  const wbot = getWbot(whatsappId);

  let contacts;

  try {
    contacts = await wbot.getContacts();
  } catch (err) {
    console.log(
      "Could not get whatsapp contacts from phone. Check connection page.",
      err
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
          const contactObj = { name: name || pushname, number };
          dataArray.push(contactObj);
        }
      })
    );
    if (dataArray.length) {
      Contact.bulkCreate(dataArray, {
        fields: ["number", "name"],
        updateOnDuplicate: ["number"]
      });
    }
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export default SyncContactsWhatsappInstanceService;
