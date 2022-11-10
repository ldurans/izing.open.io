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
import AppError from "../errors/AppError";
import VerifyContact from "../services/WbotServices/helpers/VerifyContact";
import FindOrCreateTicketService from "../services/TicketServices/FindOrCreateTicketService";
import CreateMessageSystemService from "../services/MessageServices/CreateMessageSystemService";

export default {
  key: "SendMessageAPI",
  options: {
    delay: 6000,
    attempts: 50,
    removeOnComplete: true,
    removeOnFail: false,
    backoff: {
      type: "fixed",
      delay: 60000 * 3 // 3 min
    }
  },
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async handle({ data }: any) {
    try {
      const wbot = getWbot(data.sessionId);
      const message: any = {} as WbotMessage;
      try {
        const idNumber = await wbot.getNumberId(data.number);
        if (!idNumber) {
          const payload = {
            ack: -1,
            body: data.body,
            messageId: "",
            number: data.number,
            externalKey: data.externalKey,
            error: "number invalid in whatsapp",
            type: "hookMessageStatus",
            authToken: data.authToken
          };

          if (data.media) {
            // excluir o arquivo se o número não existir
            fs.unlinkSync(data.media.path);
          }

          if (data?.apiConfig?.urlMessageStatus) {
            Queue.add("WebHooksAPI", {
              url: data.apiConfig.urlMessageStatus,
              type: payload.type,
              payload
            });
          }
          return payload;
        }

        // '559891191708@c.us'
        const msgContact = await wbot.getContactById(idNumber._serialized);
        const contact = await VerifyContact(msgContact, data.tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages: 0,
          tenantId: data.tenantId,
          groupContact: undefined,
          msg: data,
          channel: "whatsapp"
        });

        await CreateMessageSystemService({
          msg: data,
          tenantId: data.tenantId,
          ticket,
          sendType: "API",
          status: "pending"
        });

        await ticket.update({
          apiConfig: {
            ...data.apiConfig,
            externalKey: data.externalKey
          }
        });
      } catch (error) {
        const payload = {
          ack: -2,
          body: data.body,
          messageId: "",
          number: data.number,
          externalKey: data.externalKey,
          error: "error session",
          type: "hookMessageStatus",
          authToken: data.authToken
        };

        if (data?.apiConfig?.urlMessageStatus) {
          Queue.add("WebHooksAPI", {
            url: data.apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }
        throw new Error(error);
      }

      // const apiMessage = await UpsertMessageAPIService({
      //   sessionId: data.sessionId,
      //   messageId: message.id.id,
      //   body: data.body,
      //   ack: message.ack,
      //   number: data.number,
      //   mediaName: data?.media?.filename,
      //   mediaUrl: data.mediaUrl,
      //   timestamp: message.timestamp,
      //   externalKey: data.externalKey,
      //   messageWA: message,
      //   apiConfig: data.apiConfig,
      //   tenantId: data.tenantId
      // });
    } catch (error) {
      logger.error({ message: "Error send message api", error });
      throw new Error(error);
    }
  }
};
