import { Request, Response } from "express";
import { getIO } from "../libs/socket";

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

  const io = getIO();
  io.to(`${tenantId}-${ticket.status}`).emit(`${tenantId}-ticket`, {
    action: "create",
    ticket
  });

  return res.status(200).json(ticket);
};

export const show = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;

  const contact = await ShowTicketService({ id: ticketId, tenantId });

  return res.status(200).json(contact);
};

export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;

  const ticketData: TicketData = { ...req.body, tenantId };

  const { ticket, oldStatus, oldUserId } = await UpdateTicketService({
    ticketData,
    ticketId
  });

  const io = getIO();

  if (ticket.status !== oldStatus || ticket.user?.id !== oldUserId) {
    io.to(`${tenantId}-${oldStatus}`).emit(`${tenantId}-ticket`, {
      action: "delete",
      ticketId: ticket.id
    });
  }

  io.to(`${tenantId}-${ticket.status}`)
    .to(`${tenantId}-notification`)
    .to(`${tenantId}-${ticketId}`)
    .emit(`${tenantId}-ticket`, {
      action: "updateStatus",
      ticket
    });

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
