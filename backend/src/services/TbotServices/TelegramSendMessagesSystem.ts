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
import { generateMessage } from "../../utils/mustache";
// import { sleepRandomTime } from "../../utils/sleepRandomTime";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

interface Session extends Telegraf {
  id: number;
}

const SendMessagesSystemWbot = async (
  tbot: Session,
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
        where: { tenantId, channel: "telegram", whatsappId: tbot.id },
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
          generateMessage(message.body, ticket),
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

      await Message.update(
        { ...messageToUpdate },
        { where: { id: message.id } }
      );

      socketEmit({
        tenantId: ticket.tenantId,
        type: "chat:ack",
        payload: {
          ...message.dataValues, // necessário para enviar error no envio do socket - call size
          id: message.id,
          mediaUrl: message.mediaUrl,
          timestamp: messageToUpdate.timestamp,
          messageId: sendedMessage.message_id,
          status: "sended",
          ack: 2
        }
      });

      logger.info("Message Update ok");
      await SetTicketMessagesAsRead(ticket);

      // delay para processamento da mensagem
      // await sleepRandomTime({
      //   minMilliseconds: Number(process.env.MIN_SLEEP_INTERVAL || 2000),
      //   maxMilliseconds: Number(process.env.MAX_SLEEP_INTERVAL || 5000)
      // });

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

export default SendMessagesSystemWbot;
