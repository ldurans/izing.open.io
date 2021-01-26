import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  tenantId: string | number;
}

const DeleteContactService = async ({
  id,
  tenantId
}: Request): Promise<void> => {
  const contact = await Contact.findOne({
    where: { id, tenantId }
  });

  if (!contact) {
    throw new AppError("ERR_NO_CONTACT_FOUND", 404);
  }

  await contact.destroy();
};

export default DeleteContactService;
