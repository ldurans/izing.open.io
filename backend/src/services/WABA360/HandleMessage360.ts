import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import VerifyContactWaba360 from "./VerifyContactWaba360";
import VerifyMediaMessage360 from "./VerifyMediaMessage360";
import VerifyMessage360 from "./VerifyMessage360";

const HandleMessage360 = async (
  context: WabaContext,
  channelId: number | string
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      let channel;
      let contact;
      const unreadMessages = 1;
      try {
        channel = await ShowWhatsAppService({ id: channelId });
        contact = await VerifyContactWaba360(
          context.contacts[0],
          channel.tenantId
        );
        const msgData = {
          ...context.messages[0],
          fromMe: false,
          message_id: context.messages[0].id
        };
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: channel.id,
          unreadMessages,
          tenantId: channel.tenantId,
          msg: msgData,
          channel: "waba"
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
          await VerifyMediaMessage360(channel, msgData, ticket, contact);
        } else {
          await VerifyMessage360(msgData, ticket, contact);
        }
        // await VerifyStepsChatFlowTicket(msgData, ticket);

        // await verifyBusinessHours(msgData, ticket);
        resolve();
      } catch (error) {
        logger.error(error);
        reject(error);
      }
    })();
  });
};

export default HandleMessage360;
