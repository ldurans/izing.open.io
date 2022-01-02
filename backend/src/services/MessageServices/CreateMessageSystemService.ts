// import { writeFile } from "fs";
// import { promisify } from "util";
// import { join } from "path";
import * as Sentry from "@sentry/node";
import { getUnixTime } from "date-fns";
import { logger } from "../../utils/logger";
// import MessageOffLine from "../../models/MessageOffLine";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";

interface MessageData {
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
  quotedMsgId?: string;
  // status?: string;
  scheduleDate?: string | Date;
  sendType?: string;
  status?: string;
  tenantId: string | number;
}

interface MessageRequest {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
}

interface Request {
  msg: MessageRequest;
  scheduleDate?: string | Date;
  sendType: string;
  status: string;
  tenantId: string | number;
  medias?: Express.Multer.File[];
  ticket: Ticket;
  userId?: number | string;
}

// const writeFileAsync = promisify(writeFile);

const CreateMessageSystemService = async ({
  msg,
  tenantId,
  medias,
  ticket,
  userId,
  scheduleDate,
  sendType,
  status
}: Request): Promise<void> => {
  const messageData: MessageData = {
    ticketId: ticket.id,
    body: msg.body,
    contactId: ticket.contactId,
    fromMe: msg.fromMe,
    read: true,
    mediaType: "chat",
    mediaUrl: undefined,
    timestamp: getUnixTime(new Date()),
    quotedMsgId: msg.quotedMsg?.id,
    userId,
    scheduleDate,
    sendType,
    status,
    tenantId
  };

  try {
    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File) => {
          try {
            if (!media.filename) {
              const ext = media.mimetype.split("/")[1].split(";")[0];
              media.filename = `${new Date().getTime()}.${ext}`;
            }

            // await writeFileAsync(
            //   join(__dirname, "..", "..", "..", "..", "public", media.filename),
            //   media.buffer,
            //   "base64"
            // );
          } catch (err) {
            Sentry.captureException(err);
            logger.error(err);
          }

          const message = {
            ...messageData,
            body: media.originalname,
            mediaUrl: media.filename,
            mediaType: media.mimetype.substr(0, media.mimetype.indexOf("/"))
          };

          const msgCreated = await Message.create(message);

          const messageCreated = await Message.findByPk(msgCreated.id, {
            include: [
              {
                model: Ticket,
                as: "ticket",
                where: { tenantId }
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
        })
      );
    } else {
      const msgCreated = await Message.create({
        ...messageData,
        mediaType: "chat"
      });

      const messageCreated = await Message.findByPk(msgCreated.id, {
        include: [
          {
            model: Ticket,
            as: "ticket",
            where: { tenantId }
          },
          {
            model: Message,
            as: "quotedMsg",
            include: ["contact"]
          }
        ]
      });

      if (!messageCreated) {
        // throw new AppError("ERR_CREATING_MESSAGE", 501);
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
    logger.error("CreateMessageSystemService", error);
  }
};

export default CreateMessageSystemService;
