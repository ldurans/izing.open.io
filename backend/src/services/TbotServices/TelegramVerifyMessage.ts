// import * as Sentry from "@sentry/node";

import { Context } from "telegraf";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
// import { logger } from "../../utils/logger";

const VerifyMessage = async (
  ctx: Context | any,
  fromMe: boolean,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  // Sentry.captureException(err);
  // logger.error(err);

  const messageData = {
    messageId: String(ctx.message?.message_id),
    ticketId: ticket.id,
    contactId: fromMe ? undefined : contact.id,
    body: ctx.message.text,
    fromMe,
    read: fromMe,
    mediaType: "chat",
    quotedMsgId: "",
    timestamp: ctx.message.date,
    status: "received"
  };
  await ticket.update({
    lastMessage: ctx.message.text,
    lastMessageAt: new Date().getTime(),
    answered: fromMe || false
  });
  await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });
};

export default VerifyMessage;
