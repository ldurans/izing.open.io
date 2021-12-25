import Contact from "../../models/Contact";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";

interface WABAContact {
  profile: {
    name: string;
  };
  // eslint-disable-next-line camelcase
  wa_id: string;
}

const VerifyContactWaba360 = async (
  contact: WABAContact,
  tenantId: string | number
): Promise<Contact> => {
  const profilePicUrl = undefined;

  const contactData = {
    name: contact.profile.name || "",
    number: contact.wa_id,
    profilePicUrl,
    tenantId,
    pushname: contact.profile.name || "",
    isUser: false,
    isWAContact: true,
    isGroup: false
  };

  const newContact = await CreateOrUpdateContactService(contactData);

  return newContact;
};

export default VerifyContactWaba360;
