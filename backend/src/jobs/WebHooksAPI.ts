/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { logger } from "../utils/logger";

interface Data {
  url: string;
  type: string;
  payload: any;
}

interface HandlerPayload {
  data: Data;
}

export default {
  key: "WebHooksAPI",
  options: {
    delay: 6000,
    attempts: 50,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: HandlerPayload) {
    try {
      let payload = {};

      // return se não houver url informada
      if (!data?.url) {
        return { message: "url configurar no webhook não existe." };
      }

      if (data.type === "hookMessageStatus") {
        payload = {
          ack: data.payload.ack,
          messageId: data.payload.messageId,
          externalKey: data.payload.externalKey,
          type: data.type
        };
      }

      if (data.type === "hookMessage") {
        payload = {
          timestamp: data.payload.timestamp,
          message: data.payload.msg,
          messageId: data.payload.messageId,
          ticketId: data.payload.ticketId,
          externalKey: data.payload.externalKey,
          type: data.type
        };
      }

      if (data.type === "hookSessionStatus") {
        payload = {
          name: data.payload.name,
          number: data.payload.number,
          status: data.payload.status,
          qrcode: data.payload.qrcode,
          timestamp: data.payload.timestamp,
          type: data.type
        };
      }

      if (data.payload.authToken) {
        await axios.post(data.url, payload, {
          headers: { authorization: data.payload.authToken }
        });
      } else {
        await axios.post(data.url, payload);
      }

      logger.info(
        `Queue WebHooksAPI success: Data: ${data} Payload: ${payload}`
      );
      return {
        data,
        payload
      };
    } catch (error) {
      logger.error(`Error send message api: ${error}`);
      if (error?.response?.status === 404) {
        return { message: "url configurar no webhook não existe." };
      }
      throw new Error(error);
    }
  }
};
