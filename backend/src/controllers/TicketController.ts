import { Request, Response } from "express";
import { Op } from "sequelize";
import { getIO } from "../libs/socket";
import Message from "../models/Message";

import CreateTicketService from "../services/TicketServices/CreateTicketService";
import DeleteTicketService from "../services/TicketServices/DeleteTicketService";
import ListTicketsService from "../services/TicketServices/ListTicketsService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import UpdateTicketService from "../services/TicketServices/UpdateTicketService";

type IndexQuery = {
  searchParam: string;
  pageNumber: string;
  status: string[];
  date: string;
  showAll: string;
  withUnreadMessages: string;
  queuesIds: string[];
  isNotAssignedUser: string;
  includeNotQueueDefined: string;
};

interface TicketData {
  contactId: number;
  status: string;
  userId: number;
  tenantId: string | number;
}

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId, profile } = req.user;
  const {
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined
  } = req.query as IndexQuery;

  const userId = req.user.id;

  const { tickets, count, hasMore } = await ListTicketsService({
    searchParam,
    pageNumber,
    status,
    date,
    showAll,
    userId,
    withUnreadMessages,
    queuesIds,
    isNotAssignedUser,
    includeNotQueueDefined,
    tenantId,
    profile
  });

  return res.status(200).json({ tickets, count, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { tenantId } = req.user;
  const { contactId, status, userId }: TicketData = req.body;

  const ticket = await CreateTicketService({
    contactId,
    status,
    userId,
    tenantId
  });

  // se ticket criado pelo próprio usuário, não emitir socket.
  if (!userId) {
    const io = getIO();
    io.to(`${tenantId}-${ticket.status}`).emit(`${tenantId}-ticket`, {
      action: "create",
      ticket
    });
  }

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;

  const ticket = await ShowTicketService({ id: ticketId, tenantId });
  const scheduledMessages = await Message.findAll({
    where: {
      contactId: ticket.contactId,
      scheduleDate: { [Op.not]: null },
      status: "pending"
    },
    logging: console.log
  });

  ticket.setDataValue("scheduledMessages", scheduledMessages);

  return res.status(200).json(ticket);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const { isTransference } = req.body;

  const ticketData: TicketData = { ...req.body, tenantId };

  const { ticket } = await UpdateTicketService({
    ticketData,
    ticketId,
    isTransference
  });

  // const io = getIO();

  // if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
  //   io.to(`${tenantId}-${oldStatus}`).emit(`${tenantId}-ticket`, {
  //     action: "delete",
  //     ticketId: ticket.id
  //   });
  // }

  // io.to(`${tenantId}-${ticket.status}`)
  //   .to(`${tenantId}-notification`)
  //   .to(`${tenantId}-${ticketId}`)
  //   .emit(`${tenantId}-ticket`, {
  //     action: "updateStatus",
  //     ticket
  //   });

  return res.status(200).json(ticket);
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;

  const ticket = await DeleteTicketService({ id: ticketId, tenantId });

  const io = getIO();
  io.to(`${tenantId}-${ticket.status}`)
    .to(`${tenantId}-${ticketId}`)
    .to(`${tenantId}-notification`)
    .emit(`${tenantId}-ticket`, {
      action: "delete",
      ticketId: +ticketId
    });

  return res.status(200).json({ message: "ticket deleted" });
};
