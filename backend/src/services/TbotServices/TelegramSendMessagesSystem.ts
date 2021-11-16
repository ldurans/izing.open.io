/* eslint-disable no-await-in-loop */
import { join } from "path";
import { Op } from "sequelize";
import { Telegraf } from "telegraf";
import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
// import { sleepRandomTime } from "../../utils/sleepRandomTime";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

interface Session extends Telegraf {
  id?: number;
}

const SendMessagesSystemWbot = async (
  tbot: Session,
  tenantId: number | string
): Promise<void> => {
  const messages = await Message.findAll({
    where: {
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
    },
    include: [
      "contact",
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId, channel: "telegram" },
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

  await Promise.all(
    messages.map(async message => {
      // let quotedMsgSerializedId: string | undefined;
      const { ticket } = message;
      const chatId = ticket.contact.telegramId;
      console.log(tbot);
      // if (message.quotedMsg) {
      //   quotedMsgSerializedId = `${message.quotedMsg.fromMe}_${contactNumber}@${typeGroup}.us_${message.quotedMsg.messageId}`;
      // }

      try {
        if (message.mediaType !== "chat" && message.mediaName) {
          const customPath = join(__dirname, "..", "..", "..", "public");
          const mediaPath = join(customPath, message.mediaName);
          // const newMedia = tbot.telegram.send MessageMedia.fromFilePath(mediaPath);
          // sendedMessage = await wbot.sendMessage(chatId, newMedia, {
          //   quotedMessageId: quotedMsgSerializedId,
          //   linkPreview: false, // fix: send a message takes 2 seconds when there's a link on message body
          //   sendAudioAsVoice: true
          // });
          console.log("Media", newMedia);
          console.log("chatId", chatId);
          logger.info("sendMessage media");
        } else {
          sendedMessage = await tbot.telegram.sendMessage(chatId, message.body);
          logger.info("sendMessage text");
        }

        console.log("sendedMessage", sendedMessage);

        // enviar old_id para substituir no front a mensagem corretamente
        const messageToUpdate = {
          ...message,
          ...sendedMessage,
          id: message.id,
          timestamp: sendedMessage.date,
          messageId: sendedMessage.message_id,
          status: "sended"
        };

        await Message.update(
          { ...messageToUpdate },
          { where: { id: message.id } }
        );

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
        logger.error(
          `Error send message (id: ${idMessage})::${JSON.stringify(error)}`
        );
      }
    })
  );
};

export default SendMessagesSystemWbot;
