import { Context } from "telegraf";
import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";
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
  // logger.error(err);
  let message;
  let updateMessage: any = {};
  message = ctx?.message;
  updateMessage = ctx?.update;

  // Verificar se mensagem foi editada.
  if (!message && updateMessage) {
    message = updateMessage?.edited_message;
  }

  let quotedMsgId;
  if (message?.reply_to_message?.message_id) {
    const messageQuoted = await getQuotedForMessageId(
      message.reply_to_message.message_id,
      ticket.tenantId
    );
    quotedMsgId = messageQuoted?.id || undefined;
  }

  const messageData = {
    messageId: String(message?.message_id),
    ticketId: ticket.id,
    contactId: fromMe ? undefined : contact.id,
    body: message.text,
    fromMe,
    read: fromMe,
    mediaType: "chat",
    quotedMsgId,
    timestamp: +message.date * 1000, // compatibilizar JS
    status: "received"
  };
  await ticket.update({
    lastMessage: message.text,
    lastMessageAt: new Date().getTime(),
    answered: fromMe || false
  });
  await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });
};

export default VerifyMessage;
