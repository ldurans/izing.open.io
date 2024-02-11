import { join } from "path";
import { pupa } from "../../utils/pupa";
import { logger } from "../../utils/logger";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";
import SendMessageSystemProxy from "../../helpers/SendMessageSystemProxy";

interface MessageData {
  id?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp?: number;
  internalId?: string;
  userId?: string | number;
  tenantId: string | number;
  quotedMsgId?: string;
  // status?: string;
  scheduleDate?: string | Date;
  sendType?: string;
  status?: string;
}

interface MessageRequest {
  data: {
    message?: string;
    values?: string[];
    caption?: string;
    ext?: string;
    mediaUrl?: string;
    name?: string;
    type?: string;
  };
  id: string;
  type: "MessageField" | "MessageOptionsField" | "MediaField";
}

interface Request {
  msg: MessageRequest;
  tenantId: string | number;
  ticket: Ticket;
  userId?: number | string;
}

// const writeFileAsync = promisify(writeFile);

const BuildSendMessageService = async ({
  msg,
  tenantId,
  ticket,
  userId
}: Request): Promise<void> => {
  const messageData: MessageData = {
    ticketId: ticket.id,
    body: "",
    contactId: ticket.contactId,
    fromMe: true,
    read: true,
    mediaType: "chat",
    mediaUrl: undefined,
    timestamp: new Date().getTime(),
    quotedMsgId: undefined,
    userId,
    scheduleDate: undefined,
    sendType: "bot",
    status: "pending",
    tenantId
  };

  try {
    if (msg.type === "MediaField" && msg.data.mediaUrl) {
      const urlSplit = msg.data.mediaUrl.split("/");

      const message = {
        ...messageData,
        body: msg.data.name,
        mediaName: urlSplit[urlSplit.length - 1],
        mediaUrl: urlSplit[urlSplit.length - 1],
        mediaType: msg.data.type
          ? msg.data?.type.substr(0, msg.data.type.indexOf("/"))
          : "chat"
      };

      const customPath = join(__dirname, "..", "..", "..", "public");
      const mediaPath = join(customPath, message.mediaUrl);

      const media = {
        path: mediaPath,
        filename: message.mediaName
      };

      const messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: message,
        media,
        userId
      });

      const msgCreated = await Message.create({
        ...message,
        ...messageSent,
        id: messageData.id,
        messageId: messageSent.id?.id || messageSent.messageId || null
      });

      const messageCreated = await Message.findByPk(msgCreated.id, {
        include: [
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

      if (!messageCreated) {
        throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
      }

      await ticket.update({
        lastMessage: messageCreated.body,
        lastMessageAt: new Date().getTime()
      });

      socketEmit({
        tenantId,
        type: "chat:create",
        payload: messageCreated
      });
    } else {
      // Alter template message
      msg.data.message = pupa(msg.data.message || "", {
        // greeting: será considerado conforme data/hora da mensagem internamente na função pupa
        protocol: ticket.protocol,
        name: ticket.contact.name
      });

      const messageSent = await SendMessageSystemProxy({
        ticket,
        messageData: {
          ...messageData,
          body: msg.data.message
        },
        media: null,
        userId: null
      });

      const msgCreated = await Message.create({
        ...messageData,
        ...messageSent,
        id: messageData.id,
        messageId: messageSent.id?.id || messageSent.messageId || null,
        mediaType: "bot"
      });

      const messageCreated = await Message.findByPk(msgCreated.id, {
        include: [
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

      if (!messageCreated) {
        throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
      }

      await ticket.update({
        lastMessage: messageCreated.body,
        lastMessageAt: new Date().getTime(),
        answered: true
      });

      socketEmit({
        tenantId,
        type: "chat:create",
        payload: messageCreated
      });
    }
  } catch (error) {
    logger.error("BuildSendMessageService", error);
  }
};

export default BuildSendMessageService;
