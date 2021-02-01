import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import { getIO } from "../../libs/socket";

interface TicketData {
  status?: string;
  userId?: number;
  tenantId: number | string;
  queueId?: number | null;
  autoReplyId?: number | string | null;
  stepAutoReplyId?: number | string | null;
}

interface Request {
  ticketData: TicketData;
  ticketId: string | number;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId
}: Request): Promise<Response> => {
  const { status, userId, tenantId, queueId } = ticketData;

  const ticket = await Ticket.findOne({
    where: { id: ticketId, tenantId },
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  if (!ticket) {
    throw new AppError("ERR_NO_TICKET_FOUND", 404);
  }

  await SetTicketMessagesAsRead(ticket);

  const oldStatus = ticket.status;
  const oldUserId = ticket.user?.id;

  if (oldStatus === "closed") {
    await CheckContactOpenTickets(ticket.contact.id);
  }

  // verificar se o front envia close e substituir por closed
  const statusData = status === "close" ? "closed" : status;

  await ticket.update({
    status: statusData,
    queueId,
    userId
  });

  await ticket.reload();

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(`${tenantId}-${oldStatus}`).emit(`${tenantId}-ticket`, {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(`${tenantId}-${ticket.status}`)
    .to(`${tenantId}-notification`)
    .to(`${tenantId}-${ticketId.toString()}`)
    .emit(`${tenantId}-ticket`, {
      action: "update",
      ticket
    });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
