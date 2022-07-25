import { writeFile } from "fs";
import { promisify } from "util";
import { join } from "path";
import { logger } from "../../utils/logger";
import MessageOffLine from "../../models/MessageOffLine";
import { getIO } from "../../libs/socket";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";

interface MessageData {
  wId?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  timestamp?: number;
  internalId?: string;
  userId: string | number;
}

interface MessageRequest {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: MessageOffLine;
}

interface Request {
  msg: MessageRequest;
  tenantId: string | number;
  medias?: Express.Multer.File[];
  ticket: Ticket;
  userId: number | string;
}

const writeFileAsync = promisify(writeFile);

const CreateMessageOffilineService = async ({
  msg,
  tenantId,
  medias,
  ticket,
  userId
}: Request): Promise<void> => {
  const io = getIO();

  const messageData: MessageData = {
    wId: undefined,
    ticketId: ticket.id,
    body: msg.body,
    contactId: ticket.contactId,
    fromMe: msg.fromMe,
    read: true,
    mediaType: "chat",
    mediaUrl: undefined,
    timestamp: undefined,
    userId
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

            await writeFileAsync(
              join(__dirname, "..", "..", "..", "..", "public", media.filename),
              media.buffer,
              "base64"
            );
          } catch (err) {
            logger.error(err);
          }

          const message = {
            ...messageData,
            mediaUrl: media.filename,
            mediaType: media.mimetype.substr(0, media.mimetype.indexOf("/"))
          };

          const msgCreated = await MessageOffLine.create(message);

          const messageCreated = await MessageOffLine.findByPk(msgCreated.id, {
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

          if (!messageCreated) {
            throw new Error("ERR_CREATING_MESSAGE");
          }

          io.to(`${tenantId}-${messageCreated.ticketId.toString()}`)
            .to(`${tenantId}-${messageCreated.ticket.status}`)
            .to(`${tenantId}-notification`)
            .emit(`${tenantId}-appMessage`, {
              action: "create",
              message: messageCreated,
              ticket: messageCreated.ticket,
              contact: messageCreated.ticket.contact
            });

          await ticket.update({
            lastMessage: messageCreated.body,
            lastMessageAt: new Date().getTime()
          });
        })
      );
    } else {
      const msgCreated = await MessageOffLine.create({
        ...messageData,
        mediaType: "chat"
      });

      const messageCreated = await MessageOffLine.findByPk(msgCreated.id, {
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

      if (!messageCreated) {
        // throw new AppError("ERR_CREATING_MESSAGE", 501);
        throw new Error("ERR_CREATING_MESSAGE");
      }

      await ticket.update({
        lastMessage: messageCreated.body,
        lastMessageAt: new Date().getTime()
      });

      io.to(`${tenantId}-${messageCreated.ticketId.toString()}`)
        .to(`${tenantId}-${messageCreated.ticket.status}`)
        .to(`${tenantId}-notification`)
        .emit(`${tenantId}-appMessage`, {
          action: "create",
          message: messageCreated,
          ticket: messageCreated.ticket,
          contact: messageCreated.ticket.contact
        });
    }
  } catch (error) {
    logger.error("CreateMessageOffLineService", error);
  }
};

export default CreateMessageOffilineService;
