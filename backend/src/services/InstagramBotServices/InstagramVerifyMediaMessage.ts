/* eslint-disable camelcase */
import { join } from "path";
import { createWriteStream } from "fs";

import axios from "axios";
import { MessageSyncMessageWrapper } from "instagram_mqtt";

import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";

import Message from "../../models/Message";
import CreateMessageService from "../MessageServices/CreateMessageService";

const getExt = (url: string) => {
  const n = url.split("?");
  const m = n[0].split("/");
  const s = m[m.length - 1].split(".");
  return s[1];
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
  ctx: MessageSyncMessageWrapper | any,
  fromMe: boolean,
  ticket: Ticket,
  contact: Contact
): Promise<Message> => {
  // const quotedMsg = await VerifyQuotedMessage(msg);
  let mediaInfo;
  let media;
  let ext;
  let mediaType = "application";
  let type = "arquivo";

  if (ctx.message?.media?.media_type === 1) {
    media = ctx.message.media;
    [mediaInfo] = ctx.message.media.image_versions2.candidates;
    ext = getExt(mediaInfo.url);
    mediaType = "image";
    type = "imagem";
  }

  if (ctx.message?.media?.media_type === 2) {
    media = ctx.message.media;
    [mediaInfo] = ctx.message.media.video_versions;
    ext = getExt(mediaInfo.url);
    mediaType = "video";
    type = "vídeo";
  }

  if (ctx.message?.item_type === "voice_media") {
    media = ctx.message.voice_media.media;
    mediaInfo = ctx.message.voice_media.media.audio;
    ext = getExt(mediaInfo.audio_src);
    mediaType = "audio";
    type = "áudio";
  }

  const filename = `${ticket.id}_${media.id}_${new Date().getTime()}.${ext}`;
  const pathFile = join(__dirname, "..", "..", "..", "public", filename);

  const linkDownload =
    ctx.message.item_type === "voice_media"
      ? mediaInfo.audio_src
      : mediaInfo.url;
  await downloadFile(linkDownload, pathFile);
  // const media = await ctx.telegram.getFile(ctx.message?.);

  // logger.error(err);

  const messageData = {
    messageId: String(ctx.message?.item_id),
    ticketId: ticket.id,
    contactId: fromMe ? undefined : contact.id,
    body: ctx.message?.text || ctx.message?.caption || type,
    fromMe,
    read: fromMe,
    mediaUrl: filename,
    mediaType,
    quotedMsgId: "",
    timestamp: new Date().getTime(),
    status: fromMe ? "sended" : "received"
  };

  await ticket.update({
    lastMessage: ctx.message?.text || ctx.message?.caption || type,
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
