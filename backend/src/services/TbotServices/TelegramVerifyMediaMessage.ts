import { join } from "path";
import { promisify } from "util";
import { writeFile, createWriteStream } from "fs";

import { Context } from "telegraf";
import axios from "axios";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";
import { logger } from "../../utils/logger";
import getQuotedForMessageId from "../../helpers/getQuotedForMessageId";

const writeFileAsync = promisify(writeFile);

const getMediaInfo = (msg: any) => {
  // eslint-disable-next-line prettier/prettier
  const mediaType = msg.photo ? "photo" : msg.video ? "video" : msg.audio ? "audio" : msg.voice ? "voice" : msg.sticker && !msg.sticker.is_animated ? "sticker" : "document";
  const mediaObj = msg[mediaType];
  // eslint-disable-next-line prettier/prettier
  const [type, mimeType, SAD, fileName, fileId, caption, SAV] = [mediaType, mediaObj.mime_type ? mediaObj.mime_type : "", false, null, mediaObj.file_id ? mediaObj.file_id : mediaObj[mediaObj.length - 1].file_id, msg.caption ? msg.caption : "", mediaType == "voice"];
  switch (mediaType) {
    case "photo":
      return {
        type,
        mimeType: "image/png",
        SAD,
        fileName,
        fileId,
        caption,
        SAV
      };
      break;
    case "video":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "audio":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "voice":
      return { type, mimeType, SAD, fileName, fileId, caption, SAV };
      break;
    case "sticker":
      return {
        type,
        mimeType: "image/webp",
        SAD,
        fileName,
        fileId,
        caption,
        SAV,
        SAS: true
      };
      break;
    default:
      return {
        type,
        mimeType,
        SAD: true,
        fileName: mediaObj.file_name ? mediaObj.file_name : null,
        fileId,
        caption,
        SAV
      };
      break;
  }
};

const downloadFile = async (url: any, pathFile: string): Promise<void> => {
  const request = await axios({
    url: url.toString(),
    method: "GET",
    responseType: "stream"
  });
  // const writer = createWriteStream(pathFile);
  await new Promise((resolve, reject) => {
    request.data
      .pipe(createWriteStream(pathFile))
      .on("finish", async () => resolve(true))
      .on("error", (error: any) => {
        console.error("ERROR DONWLOAD", error);
        // fs.rmdirSync(mediaDir, { recursive: true });
        reject(new Error(error));
      });
  });
};

const VerifyMediaMessage = async (
  ctx: Context | any,
  fromMe: boolean,
  ticket: Ticket,
  contact: Contact
): Promise<Message | void> => {
  let message;
  let updateMessage: any = {};
  message = ctx?.message;
  updateMessage = ctx?.update;

  // Verificar se mensagem foi editada.
  if (!message && updateMessage) {
    message = updateMessage?.edited_message;
  }
  // const quotedMsg = await VerifyQuotedMessage(msg);
  const mediaInfo = await getMediaInfo(message);
  const media = await ctx.telegram.getFile(mediaInfo.fileId);

  if (!media) {
    logger.error(`ERR_DOWNLOAD_MEDIA:: ID: ${message.message_id}`);
    return;
  }

  const ext = mediaInfo.mimeType.split("/")[1].split(";")[0];
  const filename = `${media.file_id}_${new Date().getTime()}.${ext}`;
  const pathFile = join(__dirname, "..", "..", "..", "public", filename);

  const linkDownload = await ctx.telegram.getFileLink(mediaInfo.fileId);
  await downloadFile(linkDownload, pathFile);

  let quotedMsgId;
  if (message?.reply_to_message?.message_id) {
    const messageQuoted = await getQuotedForMessageId(
      message.reply_to_message.message_id,
      ticket.tenantId
    );
    quotedMsgId = messageQuoted?.id || undefined;
  }

  const messageData = {
    messageId: String(message?.message_id),
    ticketId: ticket.id,
    contactId: fromMe ? undefined : contact.id,
    body: message.text || message.caption || filename,
    fromMe,
    read: fromMe,
    mediaUrl: filename,
    mediaType: mediaInfo.mimeType.split("/")[0],
    quotedMsgId,
    timestamp: +message.date * 1000, // compatibilizar JS
    status: fromMe ? "sended" : "received"
  };

  await ticket.update({
    lastMessage: message.text || message.caption || filename,
    lastMessageAt: new Date().getTime(),
    answered: fromMe || false
  });
  const newMessage = await CreateMessageService({
    messageData,
    tenantId: ticket.tenantId
  });

  return newMessage;
};

export default VerifyMediaMessage;
