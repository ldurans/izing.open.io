import { Request, Response } from "express";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
import CreateMessageOffilineService from "../services/MessageServices/CreateMessageOfflineService";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { pageNumber } = req.query as IndexQuery;
  const { tenantId } = req.user;

  const {
    count,
    messages,
    messagesOffLine,
    ticket,
    hasMore
  } = await ListMessagesService({
    pageNumber,
    ticketId,
    tenantId
  });

  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, messagesOffLine, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId } = req.user;
  const { body, quotedMsg }: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];

  const ticket = await ShowTicketService({ id: ticketId, tenantId });

  try {
    SetTicketMessagesAsRead(ticket);

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          await SendWhatsAppMedia({ media, ticket });
        })
      );
    } else {
      await SendWhatsAppMessage({ body, ticket, quotedMsg });
    }
  } catch (error) {
    CreateMessageOffilineService({
      msg: req.body,
      tenantId,
      medias,
      ticket
    });
  }

  return res.send();
};

export const remove = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { messageId } = req.params;
  const { tenantId } = req.user;

  const message = await DeleteWhatsAppMessage(messageId, tenantId);

  const io = getIO();
  io.to(`${tenantId}-${message.ticketId.toString()}`).emit(
    `${tenantId}-appMessage`,
    {
      action: "update",
      message
    }
  );

  return res.send();
};
