import socketEmit from "../../helpers/socketEmit";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  isGroup: boolean;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  tenantId: string | number;
  pushname: string;
  isUser: boolean;
  isWAContact: boolean;
  telegramId?: string | number;
  instagramPK?: string | number;
  messengerId?: string | number;
  origem?: string;
}

const CreateOrUpdateContactService = async ({
  name,
  number: rawNumber,
  profilePicUrl,
  isGroup,
  tenantId,
  pushname,
  isUser,
  isWAContact,
  email = "",
  telegramId,
  instagramPK,
  messengerId,
  extraInfo = [],
  origem = "whatsapp"
}: Request): Promise<Contact> => {
  const number = isGroup
    ? String(rawNumber)
    : String(rawNumber).replace(/[^0-9]/g, "");

  let contact: Contact | null = null;

  if (origem === "whatsapp") {
    contact = await Contact.findOne({ where: { number, tenantId } });
  }

  if (origem === "telegram" && telegramId) {
    contact = await Contact.findOne({ where: { telegramId, tenantId } });
  }

  if (origem === "instagram" && instagramPK) {
    contact = await Contact.findOne({ where: { instagramPK, tenantId } });
  }

  if (origem === "messenger" && messengerId) {
    contact = await Contact.findOne({ where: { messengerId, tenantId } });
  }

  if (contact) {
    contact.update({
      profilePicUrl,
      pushname,
      isUser,
      isWAContact,
      telegramId,
      instagramPK,
      messengerId
    });
  } else {
    contact = await Contact.create({
      name,
      number,
      profilePicUrl,
      email,
      isGroup,
      pushname,
      isUser,
      isWAContact,
      tenantId,
      extraInfo,
      telegramId,
      instagramPK,
      messengerId
    });
  }

  socketEmit({
    tenantId,
    type: "contact:update",
    payload: contact
  });

  return contact;
};

export default CreateOrUpdateContactService;
