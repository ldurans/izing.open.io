import { join } from "path";
import { Client, MessageMedia } from "whatsapp-web.js";
import Message from "../../models/Message";
import MessagesOffLine from "../../models/MessageOffLine";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import SendWhatsAppMessage from "./SendWhatsAppMessage";
import { getIO } from "../../libs/socket";
import UserMessagesLog from "../../models/UserMessagesLog";

interface Session extends Client {
  id?: number;
}

const SendOffLineMessagesWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  const messages = await MessagesOffLine.findAll({
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
    ],
    order: [["updatedAt", "ASC"]]
  });
  const io = getIO();
  await Promise.all(
    messages.map(async message => {
      logger.info(`Send Message OffLine: ${message}`);
      try {
        if (message.mediaType !== "chat" && message.mediaName) {
          const customPath = join(__dirname, "..", "..", "..", "public");
          const mediaPath = join(
            process.env.PATH_OFFLINE_MEDIA || customPath,
            message.mediaName
          );
          const newMedia = MessageMedia.fromFilePath(mediaPath);
          const { number } = message.ticket.contact;
          const sendMessage = await wbot.sendMessage(
            `${number}@${message.ticket.isGroup ? "g" : "c"}.us`,
            newMedia,
            { sendAudioAsVoice: true }
          );
          try {
            if (message.userId) {
              await UserMessagesLog.create({
                messageId: sendMessage.id.id,
                userId: message.userId,
                ticketId: message.ticketId
              });
            }
          } catch (error) {
            logger.error(`Error criar log mensagem ${error}`);
          }
        } else {
          await SendWhatsAppMessage({
            body: message.body,
            ticket: message.ticket,
            quotedMsg: message.quotedMsg,
            userId: message.userId
          });
        }
        await MessagesOffLine.destroy({ where: { id: message.id } });
        io.to(`${tenantId}-${message.ticketId.toString()}`).emit(
          `${tenantId}-appMessage`,
          {
            action: "delete",
            message
          }
        );
      } catch (error) {
        logger.error(`Error enviar messageOffLine: ${error}`);
      }
    })
  );
};

export default SendOffLineMessagesWbot;
