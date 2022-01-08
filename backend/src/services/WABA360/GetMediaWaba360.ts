/* eslint-disable camelcase */
import axios from "axios";
import { createWriteStream } from "fs";
import { join } from "path";
import AppError from "../../errors/AppError";
import Ticket from "../../models/Ticket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

interface Request {
  channel: Whatsapp;
  msg: WabaMessage;
  ticket: Ticket;
}

const downloadFile = async (
  apiKey: string,
  wabaMediaId: string,
  filename: string
): Promise<void> => {
  const apiUrl360 = `${process.env.API_URL_360}/v1/media/${wabaMediaId}`;
  const pathFile = join(__dirname, "..", "..", "public", filename);

  const request = await axios({
    url: apiUrl360,
    method: "GET",
    responseType: "stream",
    headers: {
      "D360-API-KEY": apiKey
    }
  });

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

// Use this endpoint get media waba.
const GetMediaWaba360 = async ({
  channel,
  msg,
  ticket
}: Request): Promise<string> => {
  try {
    let mediaId = "";
    let originalName;
    let mime_type;
    if (msg?.document) {
      mediaId = msg.document.id || "";
      originalName = msg.document.filename;
      mime_type = msg.document.mime_type;
    }
    if (msg?.image) {
      mediaId = msg.image.id || "";
      mime_type = msg.image.mime_type;
    }
    if (msg?.video) {
      mediaId = msg.video.id || "";
      mime_type = msg.video.mime_type;
    }
    if (msg?.voice) {
      mediaId = msg.voice.id || "";
      const mime = msg.voice.mime_type || "";
      // necessário para tratar "audio/ogg; codecs=opus"
      const mimeSplit = mime.split(";");
      mime_type = mimeSplit.length > 1 ? mimeSplit[0] : msg.voice.mime_type;
    }
    if (msg?.audio) {
      mediaId = msg.audio.id || "";
      mime_type = msg.audio.mime_type;
    }

    const ext = mime_type?.split("/")[1].split(";")[0];
    const time = new Date().getTime();
    const filename = originalName
      ? `${originalName}_${ticket.id}_${mediaId}_${time}.${ext}`
      : `${ticket.id}_${mediaId}_${time}.${ext}`;

    await downloadFile(channel.tokenAPI, mediaId, filename);
    return filename;
  } catch (error) {
    logger.error(error);
    throw new AppError(`360_NOT_DOWNLOAD_MEDIA: ${error}`);
  }
};

export default GetMediaWaba360;
