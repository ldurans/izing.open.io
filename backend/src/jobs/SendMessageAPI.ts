/* eslint-disable @typescript-eslint/no-explicit-any */
import { MessageMedia, Message as WbotMessage } from "whatsapp-web.js";
import { v1 as uuidV1 } from "uuid";
import axios from "axios";
import { logger } from "../utils/logger";
import { getWbot } from "../libs/wbot";
import UpsertMessageAPIService from "../services/ApiMessageService/UpsertMessageAPIService";
import Queue from "../libs/Queue";

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
      let message: WbotMessage;
      if (data.media) {
        const rawBase64 = data.media;
        // eslint-disable-next-line no-useless-escape
        const matches = rawBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        const type = matches[1];
        const newMedia = new MessageMedia(type, rawBase64, uuidV1());
        message = await wbot.sendMessage(`${data.number}@c.us`, newMedia, {
          sendAudioAsVoice: true,
          caption: data.body
        });
      } else {
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
        media: data.media,
        timestamp: message.timestamp,
        externalKey: data.externalKey,
        messageWA: message,
        apiConfig: data.APIConfig,
        tenantId: data.tenantId
      });

      if (data.apiConfig.urlDelivery) {
        axios
          .post(data.apiConfig.urlDelivery, {
            ack: apiMessage.ack,
            body: apiMessage.body,
            messageId: message.id.id,
            number: data.number,
            externalKey: data.externalKey,
            type: "hookDelivery"
          })
          .then(() => {
            logger.info(`hookDelivery success: ${apiMessage}`);
          })
          .catch(() => {
            Queue.add("WebHooksAPI", {
              url: data.apiConfig.urlDelivery,
              type: "hookDelivery",
              payload: {
                ack: apiMessage.ack,
                body: apiMessage.body,
                messageId: message.id.id,
                number: data.number,
                externalKey: data.externalKey
              }
            });
          });
      }

      return apiMessage;
    } catch (error) {
      logger.error(`Error send message api: ${error}`);
      throw new Error(error);
    }
  }
};
