import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
// import VerifyMediaMessage360 from "./VerifyMediaMessage360";
// import VerifyMessage360 from "./VerifyMessage360";
import { MessengerRequestBody } from "./MessengerTypes";
import { getMessengerBot } from "../../libs/messengerBot";
import MessengerVerifyContact from "./MessengerVerifyContact";
import MessengerVerifyMessage from "./MessengerVerifyMessage";
import MessengerVerifyMediaMessage from "./MessengerVerifyMediaMessage";
import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";

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
  context: MessengerRequestBody,
  channelId: number | string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let channel;
      let contact;
      const unreadMessages = 1;
      try {
        const messagerBot = await getMessengerBot(channelId);
        channel = await ShowWhatsAppService({ id: channelId });
        const entry: any = context.entry.shift();
        const messageObj = entry?.messaging.shift();

        if (!messageObj?.message && messageObj.read) {
          // criar lógica para leitura ack
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
        if (msgData.type !== "text") {
          await MessengerVerifyMediaMessage(channel, msgData, ticket, contact);
          // await VerifyMediaMessage360(channel, msgData, ticket, contact);
        } else {
          await MessengerVerifyMessage(msgData, ticket, contact);
        }
        await VerifyStepsChatFlowTicket(msgData, ticket);

        // await verifyBusinessHours(msgData, ticket);
        resolve();
      } catch (error) {
        // Sentry.captureException(err);
        logger.error(error);
        reject(error);
      }
    })();
  });
};

export default MessengerHandleMessage;
