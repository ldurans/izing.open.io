import AppError from "../../errors/AppError";
import Contact from "../../models/Contact";
import ContactTag from "../../models/ContactTag";

interface Request {
  tags: number[] | string[];
  contactId: string;
  tenantId: string | number;
}

interface Tag {
  tagId: number | string;
  contactId: number | string;
  tenantId: number | string;
}

const UpdateContactService = async ({
  tags,
  contactId,
  tenantId
}: Request): Promise<Contact> => {
  await ContactTag.destroy({
    where: {
      tenantId,
      contactId
    }
  });

  const contactTags: Tag[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tags.forEach((tag: any) => {
    contactTags.push({
      tagId: !tag.id ? tag : tag.id,
      contactId,
      tenantId
    });
  });

  await ContactTag.bulkCreate(contactTags);

  const contact = await Contact.findOne({
    where: { id: contactId, tenantId },
    attributes: ["id", "name", "number", "email", "profilePicUrl"],
    include: [
      "extraInfo",
      "tags",
      {
        association: "wallets",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  return contact;
};

export default UpdateContactService;
