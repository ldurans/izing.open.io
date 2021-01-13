import Message from "../../models/Message";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";

interface MessageData {
  id: string;
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
  await Message.upsert(messageData);

  const message = await Message.findByPk(messageData.id, {
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
