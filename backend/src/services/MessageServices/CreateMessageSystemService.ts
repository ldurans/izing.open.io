import fs from "fs";
// import { promisify } from "util";
import { join } from "path";
import axios from "axios";
import mime from "mime";
import { v4 as uuid } from "uuid";
import { logger } from "../../utils/logger";
// import MessageOffLine from "../../models/MessageOffLine";
import Ticket from "../../models/Ticket";
import Message from "../../models/Message";
import socketEmit from "../../helpers/socketEmit";
import Queue from "../../libs/Queue";

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
  idFront?: string;
  tenantId: string | number;
}

interface MessageRequest {
  body: string;
  fromMe: boolean;
  read: boolean;
  quotedMsg?: Message;
}

interface Request {
  msg: MessageRequest | any;
  scheduleDate?: string | Date;
  sendType: string;
  status: string;
  tenantId: string | number;
  medias?: Express.Multer.File[];
  ticket: Ticket;
  userId?: number | string;
  idFront?: string;
}

// const writeFileAsync = promisify(writeFile);

const downloadMedia = async (msg: any): Promise<any> => {
  try {
    const request = await axios.get(msg.mediaUrl, {
      responseType: "stream"
    });
    const cType = request.headers["content-type"];
    const tMine: any = mime;
    const fileExt = tMine.extension(cType);
    const mediaName = uuid();
    const dir = join(__dirname, "..", "..", "..", "public");
    const fileName = `${mediaName}.${fileExt}`;
    const mediaPath = join(dir, fileName);
    const mediaData = {
      originalname: fileName,
      filename: fileName,
      mediaType: fileExt
    };
    await new Promise((resolve, reject) => {
      request.data
        .pipe(fs.createWriteStream(mediaPath))
        .on("finish", async () => {
          resolve(mediaData);
        })
        .on("error", (error: any) => {
          console.error("ERROR DONWLOAD", error);
          fs.rmdirSync(mediaPath, { recursive: true });
          reject(new Error(error));
        });
    });
    return mediaData;
  } catch (error) {
    if (error.response.status === 404) {
      const payload = {
        ack: -1,
        body: msg.body,
        messageId: "",
        number: msg.number,
        externalKey: msg.externalKey,
        error: error.message,
        authToken: msg.apiConfig.authToken,
        type: "hookMessageStatus"
      };
      if (msg?.apiConfig?.urlMessageStatus) {
        Queue.add("WebHooksAPI", {
          url: msg.apiConfig.urlMessageStatus,
          type: payload.type,
          payload
        });
      }
      return {};
    }
    throw new Error(error);
  }
};

const CreateMessageSystemService = async ({
  msg,
  tenantId,
  medias,
  ticket,
  userId,
  scheduleDate,
  sendType,
  status,
  idFront
}: Request): Promise<void> => {
  const messageData: MessageData = {
    ticketId: ticket.id,
    body: msg.body,
    contactId: ticket.contactId,
    fromMe: sendType === "API" ? true : msg?.fromMe,
    read: true,
    mediaType: "chat",
    mediaUrl: undefined,
    timestamp: new Date().getTime(),
    quotedMsgId: msg?.quotedMsg?.id,
    userId,
    scheduleDate,
    sendType,
    status,
    tenantId,
    idFront
  };

  try {
    if (sendType === "API" && msg.mediaUrl) {
      medias = [];
      const mediaData = await downloadMedia(msg);
      medias.push(mediaData);
    }

    if (sendType === "API" && !msg.mediaUrl && msg.media) {
      medias = [];
      medias.push(msg.media);
    }

    if (medias) {
      await Promise.all(
        medias.map(async (media: Express.Multer.File | any) => {
          try {
            if (!media.filename) {
              const ext = media.mimetype.split("/")[1].split(";")[0];
              media.filename = `${new Date().getTime()}.${ext}`;
            }
          } catch (err) {
            logger.error(err);
          }

          const message = {
            ...messageData,
            body: media.originalname,
            mediaUrl: media.filename,
            mediaType:
              media.mediaType ||
              media.mimetype.substr(0, media.mimetype.indexOf("/"))
          };

          const msgCreated = await Message.create(message);

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

          // Avaliar utilização do rabbitmq
          // if (!scheduleDate) {
          //   global.rabbitWhatsapp.publishInQueue(
          //     `whatsapp::${tenantId}`,
          //     JSON.stringify({
          //       ...messageCreated.toJSON(),
          //       contact: ticket.contact.toJSON()
          //     })
          //   );
          // }

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
        throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
      }

      await ticket.update({
        lastMessage: messageCreated.body,
        lastMessageAt: new Date().getTime(),
        answered: true
      });

      // Avaliar utilização do rabbitmq
      // if (!scheduleDate) {
      //   global.rabbitWhatsapp.publishInQueue(
      //     `whatsapp::${tenantId}`,
      //     JSON.stringify({
      //       ...messageCreated.toJSON(),
      //       contact: ticket.contact.toJSON()
      //     })
      //   );
      // }

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
