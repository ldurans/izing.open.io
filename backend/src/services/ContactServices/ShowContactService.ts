import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  tenantId: string | number;
}

const ShowContactService = async ({
  id,
  tenantId
}: Request): Promise<Contact> => {
  const contact = await Contact.findByPk(id, {
    include: [
      "extraInfo",
      "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!contact || contact.tenantId !== tenantId) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default ShowContactService;
