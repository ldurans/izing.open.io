import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import CreateMessageService from "../MessageServices/CreateMessageService";

const VerifyMessage360 = async (
  msg: WabaMessage,
  ticket: Ticket,
  contact: Contact
): Promise<void> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);

  const messageData = {
    messageId: msg.id || "",
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg.text?.body || "",
    fromMe: msg.fromMe,
    mediaType: msg.type,
    read: msg.fromMe,
    // quotedMsgId: quotedMsg?.id,
    timestamp: +msg.timestamp,
    status: "received"
  };

  await ticket.update({
    lastMessage: messageData.body,
    lastMessageAt: new Date().getTime(),
    answered: msg.fromMe || false
  });
  await CreateMessageService({ messageData, tenantId: ticket.tenantId });
};

export default VerifyMessage360;
