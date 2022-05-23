import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { EventMessage } from "./MessengerTypes";

interface Message extends EventMessage {
  type: string;
  timestamp: number;
}

const MessengerVerifyMessage = async (
  msg: Message | any,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  let quotedMsgId;
  if (msg?.message?.reply_to?.mid) {
    const messageQuoted = await getQuotedForMessageId(
      msg.message.reply_to.mid,
      ticket.tenantId
    );
    quotedMsgId = messageQuoted?.id || undefined;
  }

  const messageData = {
    messageId: msg.message_id || "",
    ticketId: ticket.id,
    contactId: contact.id,
    body: msg.message.text || "",
    fromMe: false,
    mediaType: msg.type,
    read: false,
    quotedMsgId,
    timestamp: msg.timestamp,
    status: "received"
  };

  await ticket.update({
    lastMessage: messageData.body,
    lastMessageAt: new Date().getTime(),
    answered: false
  });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

export default MessengerVerifyMessage;
