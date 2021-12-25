import { join } from "path";
import { promisify } from "util";
import { writeFile } from "fs";
import * as Sentry from "@sentry/node";

import { Message as WbotMessage } from "whatsapp-web.js";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import GetMediaWaba360 from "./GetMediaWaba360";
import Whatsapp from "../../models/Whatsapp";

const writeFileAsync = promisify(writeFile);

const VerifyMediaMessage = async (
  channel: Whatsapp,
  msg: WabaMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);

  const filename: any = await GetMediaWaba360({ channel, msg, ticket });

  if (!filename) {
    throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  }

  const messageData = {
    messageId: msg.id,
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg?.text?.body || filename,
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: filename,
    mediaType: msg.type,
    // quotedMsgId: undefind || quotedMsg?.id,
    timestamp: +msg.timestamp,
    status: msg.fromMe ? "sended" : "received"
  };

  await ticket.update({
    lastMessage: msg?.text?.body || filename,
    lastMessageAt: new Date().getTime(),
    answered: msg.fromMe || false
  });
  const newMessage = await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });

  return newMessage;
};

export default VerifyMediaMessage;
