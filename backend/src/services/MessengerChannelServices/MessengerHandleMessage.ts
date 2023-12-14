import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import { MessengerRequestBody } from "./MessengerTypes";
import { getMessengerBot } from "../../libs/messengerBot";
import MessengerVerifyContact from "./MessengerVerifyContact";
import MessengerVerifyMessage from "./MessengerVerifyMessage";
import MessengerVerifyMediaMessage from "./MessengerVerifyMediaMessage";
import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";
import MessengerMarkRead from "./MessengerMarkRead";
import MessengerShowChannel from "./MessengerShowChannel";
import verifyBusinessHours from "../WbotServices/helpers/VerifyBusinessHours";

// eslint-disable-next-line consistent-return
const getMessageType = (message: any) => {
  const { attachments } = message;
  const hasAttachment = attachments && attachments.length > 0;
  if (message.text && !hasAttachment) return "text";
  if (hasAttachment && attachments[0].type === "image") return "image";
  if (hasAttachment && attachments[0].type === "audio") return "audio";
  if (hasAttachment && attachments[0].type === "video") return "video";
  if (hasAttachment && attachments[0].type === "location") return "location";
  if (hasAttachment && attachments[0].type === "file") return "file";
  if (hasAttachment && attachments[0].type === "fallback") return "fallback";
};

const MessengerHandleMessage = async (
  context: MessengerRequestBody
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let channel;
      let contact;
      const unreadMessages = 1;
      try {
        if (context.object !== "page") return;

        const entry: any = context.entry.shift();
        const messageObj = entry?.messaging.shift();

        channel = await MessengerShowChannel({ fbPageId: entry.id });

        if (!channel) return;

        const messagerBot = await getMessengerBot(channel.id);

        if (!messageObj?.message && messageObj.read) {
          // criar lógica para leitura ack
          MessengerMarkRead(messageObj, channel.tenantId);
          return;
        }

        contact = await MessengerVerifyContact(
          messageObj.sender,
          messagerBot,
          channel.tenantId
        );
        const msgData = {
          ...messageObj,
          type: getMessageType(messageObj.message),
          fromMe: false,
          body: messageObj?.message?.text || "",
          timestamp: messageObj.timestamp,
          message_id: messageObj.message.mid
        };
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: channel.id,
          unreadMessages,
          tenantId: channel.tenantId,
          msg: msgData,
          channel: "messenger"
        });
        if (ticket?.isCampaignMessage) {
          resolve();
          return;
        }
        if (ticket?.isFarewellMessage) {
          resolve();
          return;
        }
        if (msgData.type !== "text") {
          await MessengerVerifyMediaMessage(channel, msgData, ticket, contact);
          // await VerifyMediaMessage360(channel, msgData, ticket, contact);
        } else {
          await MessengerVerifyMessage(msgData, ticket, contact);
        }
        await VerifyStepsChatFlowTicket(msgData, ticket);

        await verifyBusinessHours(msgData, ticket);
        resolve();
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
};

export default MessengerHandleMessage;
