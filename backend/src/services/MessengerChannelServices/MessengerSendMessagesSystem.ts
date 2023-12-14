/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { readFile } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import { join } from "path";
import { Op } from "sequelize";
import sharp from "sharp";
import { MessengerClient } from "messaging-api-messenger";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import socketEmit from "../../helpers/socketEmit";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import { sleepRandomTime } from "../../utils/sleepRandomTime";
// import { sleepRandomTime } from "../../utils/sleepRandomTime";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

interface Session extends MessengerClient {
  id: number;
}

const MessengerSendMessagesSystem = async (
  messengerBot: Session | any,
  tenantId: number | string
): Promise<void> => {
  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    [Op.or]: [
      {
        scheduleDate: {
          [Op.lte]: new Date()
        }
      },
      {
        scheduleDate: { [Op.is]: null }
      }
    ]
  };
  const messages = await Message.findAll({
    where,
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        where: {
          tenantId,
          [Op.or]: {
            status: { [Op.ne]: "closed" },
            isFarewellMessage: true
          },
          channel: "messenger",
          whatsappId: messengerBot.id
        },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });

  let sendedMessage: any;

  // logger.info(
  //   `SystemWbot SendMessages | Count: ${messages.length} | Tenant: ${tenantId} `
  // );
  for (const messageItem of messages) {
    const message: Message | any = messageItem;
    // let quotedMsgSerializedId: string | undefined;
    const { ticket } = message;
    const chatId = ticket.contact.messengerId;
    // const user = await messengerBot.getUserProfile(chatId);
    // console.log(user);

    // if (message.quotedMsg) {
    //   quotedMsgSerializedId = `${message.quotedMsg.fromMe}_${contactNumber}@${typeGroup}.us_${message.quotedMsg.messageId}`;
    // }

    try {
      if (!["chat", "text"].includes(message.mediaType) && message.mediaName) {
        const customPath = join(__dirname, "..", "..", "..", "public");
        const mediaPath = join(customPath, message.mediaName);
        const file: Buffer = await readFile(mediaPath);
        if (message.mediaType === "audio" || message.mediaType === "ptt") {
          const splitName = message.mediaName.split(".");
          const newAudioPath = join(customPath, `${splitName[0]}.mp4`);
          await new Promise((resolve, reject) => {
            ffmpeg(mediaPath)
              .toFormat("mp4")
              .on("error", error => reject(error))
              .on("end", () => resolve(true))
              .saveToFile(newAudioPath);
          });
          const voice: Buffer = await readFile(newAudioPath);
          sendedMessage = await messengerBot.sendAudio(chatId, voice);
        }
        if (message.mediaType === "image") {
          const photo = await sharp(file).jpeg().toBuffer();
          sendedMessage = await messengerBot.sendImage(chatId, photo, {
            filename: message.mediaName
          });
        }
        if (message.mediaType === "video") {
          sendedMessage = await messengerBot.sendVideo(chatId, file, {
            filename: message.mediaName
          });
        }

        if (["application", "file", "document"].includes(message.mediaType)) {
          sendedMessage = await messengerBot.sendFile(chatId, file, {
            filename: message.mediaName
          });
        }
      }
      if (["chat", "text"].includes(message.mediaType) && !message.mediaName) {
        sendedMessage = await messengerBot.sendText(chatId, message.body);
      }

      // enviar old_id para substituir no front a mensagem corretamente
      const messageToUpdate = {
        ...message,
        ...sendedMessage,
        id: message.id,
        timestamp: message.timestamp,
        messageId: sendedMessage.messageId,
        status: "sended",
        ack: 2
      };

      await Message.update(
        { ...messageToUpdate },
        { where: { id: message.id } }
      );

      socketEmit({
        tenantId: ticket.tenantId,
        type: "chat:ack",
        payload: {
          ...message.dataValues,
          mediaUrl: message.mediaUrl, // necessário para enviar error no envio do socket - call size
          id: message.id,
          timestamp: message.timestamp,
          messageId: sendedMessage.messageId,
          status: "sended",
          ack: 2
        }
      });

      logger.info("Message Update ok");
      await SetTicketMessagesAsRead(ticket);

      // delay para processamento da mensagem
      await sleepRandomTime({
        minMilliseconds: Number(500),
        maxMilliseconds: Number(1500)
      });

      // logger.info("sendMessage", sendedMessage.id.id);
    } catch (error) {
      const idMessage = message.id;
      const ticketId = message.ticket.id;
      logger.error(
        `Error message is (tenant: ${tenantId} | Ticket: ${ticketId})`
      );
      logger.error(`Error send message (id: ${idMessage}):: ${error}`);
    }
  }
};

export default MessengerSendMessagesSystem;
