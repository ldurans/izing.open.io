import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import { Op } from "sequelize";
// import { subHours } from "date-fns";
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
// import AutoReply from "../../models/AutoReply";

import { getIO } from "../../libs/socket";
import AppError from "../../errors/AppError";
import ShowTicketService from "../TicketServices/ShowTicketService";
import CreateMessageService from "../MessageServices/CreateMessageService";
import VerifyActionStepAutoReplyService from "../AutoReplyServices/VerifyActionStepAutoReplyService";
import ShowStepAutoReplyMessageService from "../AutoReplyServices/ShowStepAutoReplyMessageService";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
// import ShowAutoReplyService from "../AutoReplyServices/ShowAutoReplyService";
import CreateAutoReplyLogsService from "../AutoReplyServices/CreateAutoReplyLogsService";

interface Session extends Client {
  id?: number;
}

const writeFileAsync = promisify(writeFile);

const verifyContact = async (
  msgContact: WbotContact,
  profilePicUrl: string,
  tenantId: string | number
): Promise<Contact> => {
  const io = getIO();
  let contact = await Contact.findOne({
    where: { number: msgContact.id.user, tenantId }
  });

  if (contact) {
    await contact.update({ profilePicUrl });

    io.emit(`${tenantId}-contact`, {
      action: "update",
      contact
    });
  } else {
    contact = await Contact.create({
      name:
        msgContact.name ||
        msgContact.pushname ||
        msgContact.shortName ||
        msgContact.id.user,
      number: msgContact.id.user,
      profilePicUrl,
      tenantId
    });

    io.emit(`${tenantId}-contact`, {
      action: "create",
      contact
    });
  }

  return contact;
};

const verifyGroup = async (
  msgGroupContact: WbotContact,
  tenantId: string | number
) => {
  const profilePicUrl = await msgGroupContact.getProfilePicUrl();

  let groupContact = await Contact.findOne({
    where: { number: msgGroupContact.id.user, tenantId }
  });
  if (groupContact) {
    await groupContact.update({ profilePicUrl });
  } else {
    groupContact = await Contact.create({
      name: msgGroupContact.name,
      number: msgGroupContact.id.user,
      isGroup: msgGroupContact.isGroup,
      profilePicUrl,
      tenantId
    });
    const io = getIO();
    io.emit(`${tenantId}-contact`, {
      action: "create",
      contact: groupContact
    });
  }

  return groupContact;
};

const verifyTicket = async (
  contact: Contact,
  whatsappId: number,
  groupContact?: Contact,
  tenantId: number | string = ""
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      tenantId,
      contactId: groupContact ? groupContact.id : contact.id
    },
    include: ["contact"]
  });

  if (!ticket && groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        tenantId
      },
      order: [["createdAt", "DESC"]],
      include: ["contact"]
    });

    if (ticket) {
      await ticket.update({ status: "pending", userId: null });
    }
  }

  // Reabrir ticket caso o contato ocorra em até 1h
  // if (!ticket) {
  //   ticket = await Ticket.findOne({
  //     where: {
  //       updatedAt: {
  //         [Op.between]: [+subHours(new Date(), 1), +new Date()]
  //       },
  //       contactId: groupContact ? groupContact.id : contact.id
  //     },
  //     order: [["updatedAt", "DESC"]],
  //     include: ["contact"]
  //   });

  //   if (ticket) {
  //     await ticket.update({ status: "pending", userId: null });
  //   }
  // }

  if (!ticket) {
    const { id } = await Ticket.create({
      contactId: groupContact ? groupContact.id : contact.id,
      status: "pending",
      isGroup: !!groupContact,
      whatsappId,
      tenantId
    });
    ticket = await ShowTicketService({ id, tenantId });
  }

  return ticket;
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

const verifyMedia = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  let quotedMsg: Message | null = null;

  const media = await msg.downloadMedia();

  if (!media) {
    throw new AppError("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  if (msg.hasQuotedMsg) {
    const wbotQuotedMsg = await msg.getQuotedMessage();

    quotedMsg = await Message.findByPk(wbotQuotedMsg.id.id);
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
    console.log("writeFileAsync", err);
    console.log(err);
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
    quotedMsgId: quotedMsg?.id
  };

  const newMessage = await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });

  await ticket.update({ lastMessage: msg.body || media.filename });
  return newMessage;
};

const verifyMessage = async (
  msg: WbotMessage,
  ticket: Ticket,
  contact: Contact
) => {
  let newMessage: Message | null;
  let quotedMsg: Message | null = null;

  if (msg.hasQuotedMsg) {
    const wbotQuotedMsg = await msg.getQuotedMessage();

    quotedMsg = await Message.findByPk(wbotQuotedMsg.id.id);
  }

  if (msg.hasMedia) {
    newMessage = await verifyMedia(msg, ticket, contact);
  } else {
    const messageData = {
      id: msg.id.id,
      ticketId: ticket.id,
      contactId: msg.fromMe ? undefined : contact.id,
      body: msg.body,
      fromMe: msg.fromMe,
      mediaType: msg.type,
      read: msg.fromMe,
      quotedMsgId: quotedMsg?.id
    };

    newMessage = await CreateMessageService({
      messageData,
      tenantId: ticket.tenantId
    });
    await ticket.update({ lastMessage: msg.body });
  }

  const io = getIO();
  io.to(`${ticket.tenantId}-${ticket.id.toString()}`)
    .to(`${ticket.tenantId}-${ticket.status}`)
    .to(`${ticket.tenantId}-notification`)
    .emit(`${ticket.tenantId}-appMessage`, {
      action: "create",
      message: newMessage,
      ticket,
      contact
    });
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

const handleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
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
      msgContact = await wbot.getContactById(msg.to);

      // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
      // the media itself comes on body of message, as base64
      // if this is the case, return and let this media be handled by media_uploaded event
      // it should be improoved to handle the base64 media here in future versions

      if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard") return;
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

      groupContact = await verifyGroup(msgGroupContact, tenantId);
    }

    const profilePicUrl = await msgContact.getProfilePicUrl();
    const contact = await verifyContact(msgContact, profilePicUrl, tenantId);
    const ticket = await verifyTicket(
      contact,
      wbot.id!,
      groupContact,
      tenantId
    );
    // const welcome = await autoReplyWelcome();
    // console.log(welcome);
    await verifyMessage(msg, ticket, contact);
    await verifyAutoReplyActionTicket(msg, ticket);
  } catch (err) {
    Sentry.captureException(err);
    console.log("handleMessage", err);
  }
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
    console.log("handleMsgAck", err);
  }
};

const wbotMessageListener = (wbot: Session): void => {
  wbot.on("message_create", async msg => {
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
