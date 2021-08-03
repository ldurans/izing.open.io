import Contact from "../../models/Contact";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";

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

  const tickets = await Ticket.count({
    where: { contactId: id }
  });

  if (tickets) {
    throw new AppError("ERR_CONTACT_TICKETS_REGISTERED", 404);
  }

  await contact.destroy();

  socketEmit({
    tenantId,
    type: "contact:delete",
    payload: contact
  });
};

export default DeleteContactService;
