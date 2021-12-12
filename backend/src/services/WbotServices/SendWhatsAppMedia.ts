import fs from "fs";
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import UserMessagesLog from "../../models/UserMessagesLog";
import { logger } from "../../utils/logger";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  userId: number | string | undefined;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  userId
}: Request): Promise<WbotMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const newMedia = MessageMedia.fromFilePath(media.path);

    const sendMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`,
      newMedia,
      { sendAudioAsVoice: true }
    );

    await ticket.update({
      lastMessage: media.filename,
      lastMessageAt: new Date().getTime()
    });
    try {
      if (userId) {
        await UserMessagesLog.create({
          messageId: sendMessage.id.id,
          userId,
          ticketId: ticket.id
        });
      }
    } catch (error) {
      logger.error(`Error criar log mensagem ${error}`);
    }
    fs.unlinkSync(media.path);

    return sendMessage;
  } catch (err) {
    logger.error(`SendWhatsAppMedia | Error: ${err}`);
    // StartWhatsAppSessionVerify(ticket.whatsappId, err);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
