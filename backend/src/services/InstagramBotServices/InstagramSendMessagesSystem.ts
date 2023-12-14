/* eslint-disable camelcase */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { readFile } from "fs/promises";
import ffmpeg from "fluent-ffmpeg";
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user
} from "instagram-private-api";
import { IgApiClientMQTT } from "instagram_mqtt";
import { join } from "path";
import sharp from "sharp";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import socketEmit from "../../helpers/socketEmit";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
import { sleepRandomTime } from "../../utils/sleepRandomTime";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
    | AccountRepositoryLoginResponseLogged_in_user
    | AccountRepositoryCurrentUserResponseUser;
}

const InstagramSendMessagesSystem = async (
  instaBot: Session,
  ticket,
  message: any
): Promise<void> => {
  let sendedMessage: any;
  const chatId = ticket.contact.instagramPK;
  const threadEntity = await instaBot.entity.directThread([chatId]);

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
        sendedMessage = await threadEntity.broadcastVoice({
          file: voice
        });
      }
      if (message.mediaType === "image") {
        const photo = await sharp(file).jpeg().toBuffer();
        sendedMessage = await threadEntity.broadcastPhoto({
          file: photo
        });
      }
      if (message.mediaType === "video") {
        sendedMessage = await threadEntity.broadcastVideo({
          video: file
        });
      }
      logger.info("sendMessage media");
    }
    if (["chat", "text"].includes(message.mediaType) && !message.mediaName) {
      sendedMessage = await threadEntity.broadcastText(message.body);
      logger.info("sendMessage text");
    }

    if (!sendedMessage?.item_id) {
      throw new Error("Formato não suportado");
    }
    // enviar old_id para substituir no front a mensagem corretamente
    const messageToUpdate = {
      ...message,
      ...sendedMessage,
      id: message.id,
      timestamp: message.timestamp,
      messageId: sendedMessage.item_id,
      status: "sended",
      ack: 2
    };

    logger.info("Message Update ok");
    await SetTicketMessagesAsRead(ticket);

    return messageToUpdate;
  } catch (error) {
    const idMessage = message.id;
    logger.error(`Error send message (id: ${idMessage}):: ${error}`);
    throw error;
  }
};

export default InstagramSendMessagesSystem;
