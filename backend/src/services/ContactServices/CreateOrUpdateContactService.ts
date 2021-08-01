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
  extraInfo = []
}: Request): Promise<Contact> => {
  const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");

  let contact: Contact | null;

  contact = await Contact.findOne({ where: { number, tenantId } });

  if (contact) {
    contact.update({
      profilePicUrl,
      pushname,
      isUser,
      isWAContact
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
      extraInfo
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
