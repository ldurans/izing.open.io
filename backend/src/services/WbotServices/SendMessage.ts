import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
import { getWbot } from "../../libs/wbot";

const SendMessage = async (message: Message): Promise<void> => {
  logger.info(`SendMessage: ${message.id}`);
  const wbot = getWbot(message.ticket.whatsappId);
  let sendedMessage;

  let quotedMsgSerializedId: string | undefined;
  const { ticket } = message;
  const contactNumber = message.contact.number;
  const typeGroup = ticket?.isGroup ? "g" : "c";
  const chatId = `${contactNumber}@${typeGroup}.us`;

  if (message.quotedMsg) {
    quotedMsgSerializedId = `${message.quotedMsg.fromMe}_${contactNumber}@${typeGroup}.us_${message.quotedMsg.messageId}`;
  }

  if (message.mediaType !== "chat" && message.mediaName) {
    const customPath = join(__dirname, "..", "..", "..", "public");
    const mediaPath = join(customPath, message.mediaName);
    const newMedia = MessageMedia.fromFilePath(mediaPath);
    sendedMessage = await wbot.sendMessage(chatId, newMedia, {
      quotedMessageId: quotedMsgSerializedId,
      linkPreview: false, // fix: send a message takes 2 seconds when there's a link on message body
      sendAudioAsVoice: true
    });
  } else {
    sendedMessage = await wbot.sendMessage(chatId, message.body, {
      quotedMessageId: quotedMsgSerializedId,
      linkPreview: false // fix: send a message takes 2 seconds when there's a link on message body
    });
  }

  // enviar old_id para substituir no front a mensagem corretamente
  const messageToUpdate = {
    ...message,
    ...sendedMessage,
    id: message.id,
    messageId: sendedMessage.id.id,
    status: "sended"
  };

  await Message.update({ ...messageToUpdate }, { where: { id: message.id } });

  logger.info("rabbit::sendedMessage", sendedMessage.id.id);
};

export default SendMessage;
