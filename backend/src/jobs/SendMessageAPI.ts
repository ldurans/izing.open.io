/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import fs from "fs";
import { v4 as uuid } from "uuid";
import axios from "axios";
import mime from "mime-types";
import { join } from "path";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import UpsertMessageAPIService from "../services/ApiMessageService/UpsertMessageAPIService";
import Queue from "../libs/Queue";
import CheckIsValidContact from "../services/WbotServices/CheckIsValidContact";

export default {
  key: "SendMessageAPI",
  options: {
    delay: 6000,
    attempts: 50,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.sessionId);
      let message: any = {} as WbotMessage;

      try {
        const waNumber = await CheckIsValidContact(data.number, data.tenantId);
        data.number = waNumber.user;
      } catch (error) {
        if (error.message === "ERR_WAPP_INVALID_CONTACT") {
          const payload = {
            ack: -1,
            body: data.body,
            messageId: "",
            number: data.number,
            externalKey: data.externalKey,
            error: "number invalid in whatsapp",
            type: "hookMessageStatus"
          };

          // excluir o arquivo se o número não existir
          fs.unlinkSync(data.media.path);
          if (data?.apiConfig?.urlMessageStatus) {
            Queue.add("WebHooksAPI", {
              url: data.apiConfig.urlMessageStatus,
              type: payload.type,
              payload
            });
          }
          return payload;
        }
        throw new Error(error);
      }

      if (data.mediaUrl) {
        try {
          const request = await axios.get(data.mediaUrl, {
            responseType: "stream"
          });
          const cType = request.headers["content-type"];
          const fileExt = mime.extension(cType);
          const mediaName = uuid();
          const path =
            process.env.PATH_OFFLINE_MEDIA ||
            join(__dirname, "..", "..", "..", "public");
          const mediaDir = `${path}/${mediaName}`;
          const fileName = `${mediaName}.${fileExt}`;
          fs.mkdirSync(mediaDir);
          const mediaPath = join(mediaDir, fileName);
          await new Promise((resolve, reject) => {
            request.data
              .pipe(fs.createWriteStream(mediaPath))
              .on("finish", async () => {
                const newMedia = MessageMedia.fromFilePath(mediaPath);
                message = await wbot.sendMessage(
                  `${data.number}@c.us`,
                  newMedia,
                  {
                    sendAudioAsVoice: true,
                    caption: data.body
                  }
                );
                fs.unlinkSync(mediaPath);
                fs.rmdirSync(mediaDir);
                resolve(message);
              })
              .on("error", (error: any) => {
                console.error("ERROR DONWLOAD", error);
                fs.rmdirSync(mediaDir, { recursive: true });
                reject(new Error(error));
              });
          });
        } catch (error) {
          if (error.response.status === 404) {
            const payload = {
              ack: -1,
              body: data.body,
              messageId: "",
              number: data.number,
              externalKey: data.externalKey,
              error: error.message,
              type: "hookMessageStatus"
            };
            if (data?.apiConfig?.urlMessageStatus) {
              Queue.add("WebHooksAPI", {
                url: data.apiConfig.urlMessageStatus,
                type: payload.type,
                payload
              });
            }
            return payload;
          }
          throw new Error(error);
        }
      }

      if (data.media && !data.mediaUrl) {
        const newMedia = MessageMedia.fromFilePath(data.media.path);
        message = await wbot.sendMessage(`${data.number}@c.us`, newMedia, {
          sendAudioAsVoice: true,
          caption: data.body
        });

        fs.unlinkSync(data.media.path);
      }

      if (!data.media && !data.mediaUrl) {
        message = await wbot.sendMessage(`${data.number}@c.us`, data.body, {
          linkPreview: false
        });
      }

      const apiMessage = await UpsertMessageAPIService({
        sessionId: data.sessionId,
        messageId: message.id.id,
        body: data.body,
        ack: message.ack,
        number: data.number,
        mediaName: data?.media?.filename,
        mediaUrl: data.mediaUrl,
        timestamp: message.timestamp,
        externalKey: data.externalKey,
        messageWA: message,
        apiConfig: data.apiConfig,
        tenantId: data.tenantId
      });

      return apiMessage;
    } catch (error) {
      logger.error({ message: "Error send message api", error });
      throw new Error(error);
    }
  }
};
