/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { join } from "path";
import { MessageMedia } from "whatsapp-web.js";
import Message from "../../models/Message";
import { logger } from "../../utils/logger";
// import { sleepRandomTime } from "../../utils/sleepRandomTime";
import { getWbot } from "../../libs/wbot";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

const SendMessage = async (message: Message): Promise<void> => {
  logger.info(`SendMessage: ${message.id}`);
  const wbot = getWbot(message.ticket.whatsappId);
  let sendedMessage;

  // logger.info(
  //   `SystemWbot SendMessages | Count: ${messages.length} | Tenant: ${tenantId} `
  // );

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

  logger.info("rabbit::Message Update");
  // await SetTicketMessagesAsRead(ticket);

  logger.info("rabbit::sendedMessage", sendedMessage.id.id);
  // throw new Error("SIMULANDO ERRO");
};

const WhatsappConsumer = tenantId => {
  const queue = `whatsapp::${tenantId}`;
  global.rabbitWhatsapp.consumeWhatsapp(queue, async message => {
    logger.info(`SendMessage Queue: ${queue}`);
    const content = JSON.parse(message.content.toString());
    await SendMessage(content);
  });
};

export default WhatsappConsumer;
