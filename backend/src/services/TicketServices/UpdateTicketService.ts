import AppError from "../../errors/AppError";
import CheckContactOpenTickets from "../../helpers/CheckContactOpenTickets";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import Ticket from "../../models/Ticket";
import socketEmit from "../../helpers/socketEmit";
import CreateLogTicketService from "./CreateLogTicketService";

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
  isTransference?: string | boolean | null;
  userIdRequest: number | string;
}

interface Response {
  ticket: Ticket;
  oldStatus: string;
  oldUserId: number | undefined;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  isTransference,
  userIdRequest
}: Request): Promise<Response> => {
  const { status, userId, tenantId, queueId } = ticketData;

  const ticket = await Ticket.findOne({
    where: { id: ticketId, tenantId }
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

  const data: any = {
    status: statusData,
    queueId,
    userId
  };

  // se atendimento for encerrado, informar data da finalização
  if (statusData === "closed") {
    data.closedAt = new Date().getTime();
  }

  // se iniciar atendimento, retirar o bot e informar a data
  if (oldStatus === "pending" && statusData === "open") {
    data.autoReplyId = null;
    data.stepAutoReplyId = null;
    data.startedAttendanceAt = new Date().getTime();
  }

  await ticket.update(data);

  // logar o inicio do atendimento
  if (oldStatus === "pending" && statusData === "open") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "open"
    });
  }

  // logar ticket resolvido
  if (statusData === "closed") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "closed"
    });
  }

  // logar ticket retornado à pendente
  if (oldStatus === "open" && statusData === "pending") {
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "pending"
    });
  }

  if (isTransference) {
    // tranferiu o atendimento
    await CreateLogTicketService({
      userId: userIdRequest,
      ticketId,
      type: "transfered"
    });
    // recebeu o atendimento tansferido
    if (userId) {
      await CreateLogTicketService({
        type: "receivedTransfer",
        userId,
        ticketId
      });
    }
  }

  await ticket.reload();

  if (isTransference) {
    await ticket.setDataValue("isTransference", true);
  }

  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return { ticket, oldStatus, oldUserId };
};

export default UpdateTicketService;
