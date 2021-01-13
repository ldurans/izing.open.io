import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";

import {
  Contact as WbotContact,
  Message as WbotMessage,
  MessageAck,
  Client
} from "whatsapp-web.js";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

import { getIO } from "../../libs/socket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import VerifyActionStepAutoReplyService from "../AutoReplyServices/VerifyActionStepAutoReplyService";
import ShowStepAutoReplyMessageService from "../AutoReplyServices/ShowStepAutoReplyMessageService";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import CreateAutoReplyLogsService from "../AutoReplyServices/CreateAutoReplyLogsService";
import { logger } from "../../utils/logger";
import CreateOrUpdateContactService from "../ContactServices/CreateOrUpdateContactService";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

const verifyContact = async (
  msgContact: WbotContact,
  tenantId: string | number
): Promise<Contact> => {
  const profilePicUrl = await msgContact.getProfilePicUrl();

  const contactData = {
    name:
      msgContact.name ||
      msgContact.pushname ||
      msgContact.shortName ||
      msgContact.id.user,
    number: msgContact.id.user,
    profilePicUrl,
    tenantId,
    pushname: msgContact.pushname,
    isUser: msgContact.isUser,
    isWAContact: msgContact.isWAContact,
    isGroup: msgContact.isGroup
  };

  const contact = CreateOrUpdateContactService(contactData);

  return contact;
};

const verifyQuotedMessage = async (
  msg: WbotMessage
): Promise<Message | null> => {
  if (!msg.hasQuotedMsg) return null;

  const wbotQuotedMsg = await msg.getQuotedMessage();

  const quotedMsg = await Message.findOne({
    where: { id: wbotQuotedMsg.id.id }
  });

  if (!quotedMsg) return null;

  return quotedMsg;
};

const verifyMediaMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const media = await msg.downloadMedia();

  if (!media) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (!media.filename) {
    const ext = media.mimetype.split("/")[1].split(";")[0];
    media.filename = `${new Date().getTime()}.${ext}`;
  }

  try {
    await writeFileAsync(
      join(__dirname, "..", "..", "..", "public", media.filename),
      media.data,
      "base64"
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body || media.filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: media.filename,
    mediaType: media.mimetype.split("/")[0],
    quotedMsgId: quotedMsg?.id,
    timestamp: msg.timestamp
  };

  await ticket.update({ lastMessage: msg.body || media.filename });
  const newMessage = await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });

  return newMessage;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  const quotedMsg = await verifyQuotedMessage(msg);

  const messageData = {
    id: msg.id.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.body,
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    quotedMsgId: quotedMsg?.id,
    timestamp: msg.timestamp
  };

  await ticket.update({ lastMessage: msg.body });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

const isValidMsg = (msg: WbotMessage): boolean => {
  if (msg.from === "status@broadcast") return false;
  if (
    msg.type === "chat" ||
    msg.type === "audio" ||
    msg.type === "ptt" ||
    msg.type === "video" ||
    msg.type === "image" ||
    msg.type === "document" ||
    msg.type === "vcard" ||
    msg.type === "sticker"
  )
    return true;
  return false;
};

const verifyAutoReplyActionTicket = async (
  msg: WbotMessage,
  ticket: Ticket
): Promise<void> => {
  const celularContato = ticket.contact.number;
  let celularTeste = "";

  if (ticket.autoReplyId && ticket.status === "pending" && !msg.fromMe) {
    if (ticket.autoReplyId) {
      const stepAutoReplyAtual = await ShowStepAutoReplyMessageService(
        0,
        ticket.autoReplyId,
        ticket.stepAutoReplyId
      );
      const actionAutoReply = await VerifyActionStepAutoReplyService(
        ticket.stepAutoReplyId,
        msg.body
      );
      if (actionAutoReply) {
        const io = getIO();

        await CreateAutoReplyLogsService(stepAutoReplyAtual, ticket, msg.body);

        // action = 0: enviar para proximo step: nextStepId
        if (actionAutoReply.action === 0) {
          await ticket.update({
            stepAutoReplyId: actionAutoReply.nextStepId
          });
          const stepAutoReply = await ShowStepAutoReplyMessageService(
            0,
            ticket.autoReplyId,
            actionAutoReply.nextStepId
          );

          // Verificar se rotina em teste
          celularTeste = stepAutoReply.autoReply.celularTeste;
          if (
            (celularTeste &&
              celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
            !celularContato
          ) {
            return;
          }

          await SendWhatsAppMessage({
            body: stepAutoReply.reply,
            ticket,
            quotedMsg: undefined
          });
          await SetTicketMessagesAsRead(ticket);
          return;
        }

        // action = 1: enviar para fila: queue
        if (actionAutoReply.action === 1) {
          ticket.update({
            queueId: actionAutoReply.queueId,
            autoReplyId: null,
            stepAutoReplyId: null
          });
        }

        // action = 2: enviar para determinado usuário
        if (actionAutoReply.action === 2) {
          ticket.update({
            userId: actionAutoReply.userIdDestination,
            status: "open",
            autoReplyId: null,
            stepAutoReplyId: null
          });
        }
        io.to(`${ticket.tenantId}-${ticket.status}`).emit(
          `${ticket.tenantId}-ticket`,
          {
            action: "updateQueue",
            ticket
          }
        );

        if (actionAutoReply.replyDefinition) {
          await SendWhatsAppMessage({
            body: actionAutoReply.replyDefinition,
            ticket,
            quotedMsg: undefined
          });
          await SetTicketMessagesAsRead(ticket);
        }
      } else {
        // Verificar se rotina em teste
        celularTeste = stepAutoReplyAtual.autoReply.celularTeste;
        if (
          (celularTeste &&
            celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
          !celularContato
        ) {
          return;
        }

        await SendWhatsAppMessage({
          body:
            "Desculpe! Não entendi sua resposta. Vamos tentar novamente! Escolha uma opção válida.",
          ticket,
          quotedMsg: undefined
        });

        await SendWhatsAppMessage({
          body: stepAutoReplyAtual.reply,
          ticket,
          quotedMsg: undefined
        });
        await SetTicketMessagesAsRead(ticket);
      }
    }
  }
};

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!isValidMsg(msg)) {
        return;
      }
      let whatsapp;

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        whatsapp = await ShowWhatsAppService(wbot.id || "");

        const { tenantId } = whatsapp;

        if (msg.fromMe) {
          // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
          // the media itself comes on body of message, as base64
          // if this is the case, return and let this media be handled by media_uploaded event
          // it should be improoved to handle the base64 media here in future versions
          if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard")
            return;

          msgContact = await wbot.getContactById(msg.to);
        } else {
          msgContact = await msg.getContact();
        }

        const chat = await msg.getChat();

        if (chat.isGroup) {
          let msgGroupContact;

          if (msg.fromMe) {
            msgGroupContact = await wbot.getContactById(msg.to);
          } else {
            msgGroupContact = await wbot.getContactById(msg.from);
          }

          groupContact = await verifyContact(msgGroupContact, tenantId);
        }

        const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

        // const profilePicUrl = await msgContact.getProfilePicUrl();
        const contact = await verifyContact(msgContact, tenantId);
        const ticket = await FindOrCreateTicketService(
          contact,
          wbot.id!,
          unreadMessages,
          tenantId,
          groupContact
        );

        if (msg.hasMedia) {
          await verifyMediaMessage(msg, ticket, contact);
        } else {
          await verifyMessage(msg, ticket, contact);
        }
        await verifyAutoReplyActionTicket(msg, ticket);
        resolve();
      } catch (err) {
        Sentry.captureException(err);
        logger.error(err);
        reject(err);
      }
    })();
  });
};

const handleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  try {
    const messageToUpdate = await Message.findByPk(msg.id.id, {
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId"]
        }
      ]
    });
    if (!messageToUpdate) {
      return;
    }
    await messageToUpdate.update({ ack });
    const { ticket } = messageToUpdate;
    io.to(`${ticket.tenantId}-${ticket.id.toString()}`).emit(
      `${ticket.tenantId}-appMessage`,
      {
        action: "update",
        message: messageToUpdate
      }
    );
  } catch (err) {
    Sentry.captureException(err);
    logger.error(err);
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message_create", async msg => {
    console.log("message_create", wbot);
    handleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    handleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    handleMsgAck(msg, ack);
  });
};

export { wbotMessageListener, handleMessage };
