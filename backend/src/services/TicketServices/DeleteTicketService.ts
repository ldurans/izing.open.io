import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";

interface Request {
  id: string | number;
  tenantId: string | number;
}

const DeleteTicketService = async ({
  id,
  tenantId
}: Request): Promise<Ticket> => {
  const ticket = await Ticket.findOne({
    where: { id, tenantId }
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await ticket.destroy();

  return ticket;
};

export default DeleteTicketService;
