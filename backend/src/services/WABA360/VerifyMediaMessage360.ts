import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";
import GetMediaWaba360 from "./GetMediaWaba360";
import Whatsapp from "../../models/Whatsapp";

const VerifyMediaMessage = async (
  channel: Whatsapp,
  msg: WabaMessage,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  let filename;
  try {
    filename = await GetMediaWaba360({ channel, msg, ticket });
  } catch (error) { }

  // if (!filename) {
  //   throw new Error("ERR_WAPP_DOWNLOAD_MEDIA");
  // }
  let wabaMediaId;
  if (!["text", "chat", "template"].includes(msg.type)) {
    const msgData: any = msg;
    wabaMediaId = msgData[msg.type].id;
  }

  const messageData = {
    messageId: msg.id || "",
    ticketId: ticket.id,
    contactId: msg.fromMe ? undefined : contact.id,
    body: msg?.text?.body || filename || "",
    fromMe: msg.fromMe,
    read: msg.fromMe,
    mediaUrl: filename,
    mediaType: msg.type,
    // quotedMsgId: undefind || quotedMsg?.id,
    timestamp: +msg.timestamp,
    wabaMediaId,
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
