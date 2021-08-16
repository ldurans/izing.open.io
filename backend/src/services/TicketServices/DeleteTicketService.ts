import Ticket from "../../models/Ticket";
import AppError from "../../errors/AppError";
import ShowTicketService from "./ShowTicketService";
import CreateLogTicketService from "./CreateLogTicketService";

interface Request {
  id: string | number;
  tenantId: string | number;
  userId: string | number;
}

const DeleteTicketService = async ({
  id,
  tenantId,
  userId
}: Request): Promise<Ticket> => {
  const ticket = await ShowTicketService({ id, tenantId });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  // await ticket.destroy();

  await CreateLogTicketService({
    userId,
    ticketId: ticket.id,
    type: "delete"
  });

  return ticket;
};

export default DeleteTicketService;
