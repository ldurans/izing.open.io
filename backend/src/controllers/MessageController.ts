import { Request, Response } from "express";
// import GetTicketWbot from "../helpers/GetTicketWbot";

import SetTicketMessagesAsRead from "../helpers/SetTicketMessagesAsRead";
import { getIO } from "../libs/socket";
import Message from "../models/Message";
// import CreateMessageOffilineService from "../services/MessageServices/CreateMessageOfflineService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";

import ListMessagesService from "../services/MessageServices/ListMessagesService";
import ShowTicketService from "../services/TicketServices/ShowTicketService";
import DeleteWhatsAppMessage from "../services/WbotServices/DeleteWhatsAppMessage";
// import SendWhatsAppMedia from "../services/WbotServices/SendWhatsAppMedia";
// import SendWhatsAppMessage from "../services/WbotServices/SendWhatsAppMessage";

type IndexQuery = {
  pageNumber: string;
};

type MessageData = {
  body: string;
  fromMe: boolean;
  read: boolean;
  sendType?: string;
  scheduleDate?: string | Date;
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

  // verificar rotina para sync das mensagens.
  // const wbot = await GetTicketWbot(ticket);
  // const wbotChat = await wbot.getChatById(
  //   `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
  // );
  // const wbotMessages = await wbotChat.fetchMessages({ limit: 100 });
  // const mf = messages.filter
  // console.log(wbotMessages);
  SetTicketMessagesAsRead(ticket);

  return res.json({ count, messages, messagesOffLine, ticket, hasMore });
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const { tenantId, id: userId } = req.user;
  const messageData: MessageData = req.body;
  const medias = req.files as Express.Multer.File[];
  const ticket = await ShowTicketService({ id: ticketId, tenantId });

  try {
    SetTicketMessagesAsRead(ticket);

    // if (medias) {
    //   await Promise.all(
    //     medias.map(async (media: Express.Multer.File) => {
    //       await SendWhatsAppMedia({ media, ticket, userId });
    //     })
    //   );
    // } else {
    //   await SendWhatsAppMessage({ body, ticket, quotedMsg, userId });
    // }
  } catch (error) {
    console.log("SetTicketMessagesAsRead", error);
    // CreateMessageOffilineService({
    //   msg: req.body,
    //   tenantId,
    //   medias,
    //   ticket,
    //   userId
    // });
  }

  try {
    await CreateMessageSystemService({
      msg: messageData,
      tenantId,
      medias,
      ticket,
      userId,
      scheduleDate: messageData.scheduleDate,
      sendType: messageData.sendType || "chat",
      status: "pedding"
    });
  } catch (error) {
    console.log("try CreateMessageSystemService", error);
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
