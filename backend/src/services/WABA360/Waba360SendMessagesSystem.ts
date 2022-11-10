/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import { Op } from "sequelize";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import socketEmit from "../../helpers/socketEmit";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import SentMessage from "./SentMessage";

const buildWabaMessage360 = async (
  message: Message,
  chatId: string
): Promise<WabaMessage> => {
  let newMessage: WabaMessage = {
    timestamp: String(message.timestamp),
    recipient_type: "individual",
    to: chatId,
    type: "text"
  };
  if (message.mediaType === "application" || message.mediaType === "document") {
    newMessage = {
      ...newMessage,
      type: "document",
      document: {
        id: message.wabaMediaId,
        caption: message.body || message.mediaName || "" || ""
      }
    };
  }
  if (message.mediaType === "image") {
    newMessage = {
      ...newMessage,
      type: "image",
      image: {
        id: message.wabaMediaId,
        caption: message.body || message.mediaName || ""
      }
    };
  }
  if (message.mediaType === "video") {
    newMessage = {
      ...newMessage,
      type: "video",
      video: {
        id: message.wabaMediaId,
        caption: message.body || message.mediaName || ""
      }
    };
  }
  if (message.mediaType === "audio" || message.mediaType === "voice") {
    newMessage = {
      ...newMessage,
      type: "audio",
      audio: {
        id: message.wabaMediaId,
        caption: message.body || message.mediaName || ""
      }
    };
  }
  if (message.mediaType === "chat" || message.mediaType === "text") {
    newMessage = {
      ...newMessage,
      text: {
        body: message.body
      }
    };
  }
  return newMessage;
};

const where = {
  fromMe: true,
  messageId: { [Op.is]: null },
  status: "pending",
  [Op.or]: [
    {
      scheduleDate: {
        [Op.lte]: new Date()
      }
    },
    {
      scheduleDate: { [Op.is]: null }
    }
  ]
};

const Waba360SendMessagesSystem = async (
  connection: Whatsapp
): Promise<void> => {
  const messages = await Message.findAll({
    where,
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId: connection.tenantId, channel: "waba" },
        include: [
          "contact",
          {
            model: Whatsapp,
            as: "whatsapp",
            where: { id: connection.id, type: "waba", wabaBSP: "360" }
          }
        ]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });
  for (const messageItem of messages) {
    const { ticket } = messageItem;
    const chatId = String(ticket.contact.number);
    // verificar se já foi feito upload do arquivo
    if (
      !["text", "chat"].includes(messageItem.mediaType) &&
      messageItem.mediaUrl &&
      !messageItem.wabaMediaId
    ) {
      // adicionar à fila o upload do arquivo antes de seguir
      // return;
    }

    const buldedMessage = await buildWabaMessage360(messageItem, chatId);
    const sendedMessage: any = await SentMessage({
      message: buldedMessage,
      apiKey: connection.tokenAPI
    });

    const messageToUpdate: any = {
      ...messageItem,
      messageId: sendedMessage.messages[0].id,
      status: "sended",
      ack: 2
    };

    await Message.update(
      { ...messageToUpdate },
      { where: { id: messageItem.id } }
    );

    socketEmit({
      tenantId: ticket.tenantId,
      type: "chat:ack",
      payload: {
        ...messageToUpdate.dataValues,
        mediaUrl: messageItem.mediaUrl, // necessário para enviar error no envio do socket - call size
        messageId: messageToUpdate.messageId,
        status: "sended",
        ack: 2
      }
    });

    logger.info("Message Update ok");
    await SetTicketMessagesAsRead(ticket);
  }
};

export default Waba360SendMessagesSystem;
