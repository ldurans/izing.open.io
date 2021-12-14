import { Contact as WbotContact } from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import CreateOrUpdateContactService from "../../ContactServices/CreateOrUpdateContactService";

const VerifyContact = async (
  msgContact: WbotContact,
  tenantId: string | number
): Promise<Contact> => {
  let profilePicUrl;
  try {
    profilePicUrl = await msgContact.getProfilePicUrl();
  } catch (error) {
    profilePicUrl = undefined;
  }

  const contactData = {
    name:
      msgContact.name ||
      msgContact.pushname ||
      msgContact.shortName ||
      msgContact.id.user,
    number: msgContact.id.user,
    profilePicUrl,
    tenantId,
    pushname: msgContact.pushname,
    isUser: msgContact.isUser,
    isWAContact: msgContact.isWAContact,
    isGroup: msgContact.isGroup
  };

  const contact = await CreateOrUpdateContactService(contactData);

  return contact;
};

export default VerifyContact;
