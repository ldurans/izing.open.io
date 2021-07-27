import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";

interface MessageData {
  id?: string;
  messageId: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp?: number;
}
interface Request {
  messageData: MessageData;
  tenantId: string | number;
}

const CreateMessageService = async ({
  messageData,
  tenantId
}: Request): Promise<Message> => {
  const msg = await Message.findOne({
    where: { messageId: messageData.messageId }
  });
  if (!msg) {
    await Message.create(messageData);
  } else {
    await msg.update(messageData);
  }
  const message = await Message.findOne({
    where: { messageId: messageData.messageId },
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!message) {
    // throw new AppError("ERR_CREATING_MESSAGE", 501);
    throw new Error("ERR_CREATING_MESSAGE");
  }

  const io = getIO();
  const tenant = message.ticket.tenantId;
  io.to(`${tenant}-${message.ticketId.toString()}`)
    .to(`${tenant}-${message.ticket.status}`)
    .to(`${tenant}-notification`)
    .emit(`${tenant}-appMessage`, {
      action: "create",
      message,
      ticket: message.ticket,
      contact: message.ticket.contact
    });

  return message;
};

export default CreateMessageService;
