/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import { Op } from "sequelize";
import { Telegraf } from "telegraf";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import socketEmit from "../../helpers/socketEmit";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";

interface Session extends Telegraf {
  id: number;
}

const TelegramSendMessagesSystem = async (
  tbot: Session,
  ticket,
  message
): Promise<void> => {
  let sendedMessage: any;
  const chatId = ticket.contact.telegramId;
  const extraInfo: any = {};

  if (message.quotedMsg) {
    extraInfo.reply_to_message_id = message.quotedMsg.messageId;
  }

  try {
    if (!["chat", "text"].includes(message.mediaType) && message.mediaName) {
      const customPath = join(__dirname, "..", "..", "..", "public");
      const mediaPath = join(customPath, message.mediaName);
      if (message.mediaType === "audio" || message.mediaType === "ptt") {
        sendedMessage = await tbot.telegram.sendVoice(
          chatId,
          {
            source: mediaPath
          },
          extraInfo
        );
      } else if (message.mediaType === "image") {
        sendedMessage = await tbot.telegram.sendPhoto(
          chatId,
          {
            source: mediaPath
          },
          extraInfo
        );
      } else if (message.mediaType === "video") {
        sendedMessage = await tbot.telegram.sendVideo(
          chatId,
          {
            source: mediaPath
          },
          extraInfo
        );
      } else {
        sendedMessage = await tbot.telegram.sendDocument(
          chatId,
          {
            source: mediaPath
          },
          extraInfo
        );
      }

      logger.info("sendMessage media");
    } else {
      sendedMessage = await tbot.telegram.sendMessage(
        chatId,
        message.body,
        extraInfo
      );
      logger.info("sendMessage text");
    }

    // enviar old_id para substituir no front a mensagem corretamente
    const messageToUpdate = {
      ...message,
      ...sendedMessage,
      id: message.id,
      timestamp: sendedMessage.date * 1000, // compatibilizar JS
      messageId: sendedMessage.message_id,
      status: "sended",
      ack: 2
    };

    logger.info("Message Update ok");
    await SetTicketMessagesAsRead(ticket);

    return messageToUpdate;
  } catch (error) {
    const idMessage = message.id;
    logger.error(`Error send message (id: ${idMessage}):: ${error}`);
  }
};

export default TelegramSendMessagesSystem;
