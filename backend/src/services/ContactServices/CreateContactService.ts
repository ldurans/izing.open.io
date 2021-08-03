import AppError from "../../errors/AppError";
import socketEmit from "../../helpers/socketEmit";
import Contact from "../../models/Contact";

interface ExtraInfo {
  name: string;
  value: string;
}

interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  extraInfo?: ExtraInfo[];
  tenantId: string | number;
}

const CreateContactService = async ({
  name,
  number,
  email = "",
  extraInfo = [],
  tenantId
}: Request): Promise<Contact> => {
  const numberExists = await Contact.findOne({
    where: { number, tenantId }
  });

  if (numberExists) {
    throw new AppError("ERR_DUPLICATED_CONTACT");
  }

  const contact = await Contact.create(
    {
      name,
      number,
      email,
      extraInfo,
      tenantId
    },
    {
      include: [
        "extraInfo",
        "tags",
        {
          association: "wallets",
          attributes: ["id", "name"]
        }
      ]
    }
  );

  socketEmit({
    tenantId,
    type: "contact:update",
    payload: contact
  });

  return contact;
};

export default CreateContactService;
