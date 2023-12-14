import {
  Contact as WbotContact,
  Message as WbotMessage,
  Client
} from "whatsapp-web.js";
import Contact from "../../../models/Contact";
import { logger } from "../../../utils/logger";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import IsValidMsg from "./IsValidMsg";
// import VerifyAutoReplyActionTicket from "./VerifyAutoReplyActionTicket";
import VerifyContact from "./VerifyContact";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";
import verifyBusinessHours from "./VerifyBusinessHours";
import VerifyStepsChatFlowTicket from "../../ChatFlowServices/VerifyStepsChatFlowTicket";
import Queue from "../../../libs/Queue";
// import isMessageExistsService from "../../MessageServices/isMessageExistsService";
import Setting from "../../../models/Setting";

interface Session extends Client {
  id: number;
}

const HandleMessage = async (
  msg: WbotMessage,
  wbot: Session
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      if (!IsValidMsg(msg)) {
        return;
      }

      const whatsapp = await ShowWhatsAppService({ id: wbot.id });

      const { tenantId } = whatsapp;
      const chat = await msg.getChat();
      // IGNORAR MENSAGENS DE GRUPO
      const Settingdb = await Setting.findOne({
        where: { key: "ignoreGroupMsg", tenantId }
      });

      if (
        Settingdb?.value === "enabled" &&
        (chat.isGroup || msg.from === "status@broadcast")
      ) {
        return;
      }
      // IGNORAR MENSAGENS DE GRUPO

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        if (msg.fromMe) {
          // media messages sent from me from cell phone, first comes with "hasMedia = false" and type = "image/ptt/etc"
          // the media itself comes on body of message, as base64
          // if this is the case, return and let this media be handled by media_uploaded event
          // it should be improoved to handle the base64 media here in future versions
          if (!msg.hasMedia && msg.type !== "chat" && msg.type !== "vcard")
            return;

          msgContact = await wbot.getContactById(msg.to);
        } else {
          msgContact = await msg.getContact();
        }

        if (chat.isGroup) {
          let msgGroupContact;

          if (msg.fromMe) {
            msgGroupContact = await wbot.getContactById(msg.to);
          } else {
            msgGroupContact = await wbot.getContactById(msg.from);
          }

          groupContact = await VerifyContact(msgGroupContact, tenantId);
        }

        const unreadMessages = msg.fromMe ? 0 : chat.unreadCount;

        // const profilePicUrl = await msgContact.getProfilePicUrl();
        const contact = await VerifyContact(msgContact, tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages,
          tenantId,
          groupContact,
          msg,
          channel: "whatsapp"
        });

        if (ticket?.isCampaignMessage) {
          resolve();
          return;
        }

        if (ticket?.isFarewellMessage) {
          resolve();
          return;
        }

        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, contact);
        } else {
          await VerifyMessage(msg, ticket, contact);
        }

        const isBusinessHours = await verifyBusinessHours(msg, ticket);

        // await VerifyAutoReplyActionTicket(msg, ticket);
        if (isBusinessHours) await VerifyStepsChatFlowTicket(msg, ticket);

        const apiConfig: any = ticket.apiConfig || {};
        if (
          !msg.fromMe &&
          !ticket.isGroup &&
          !ticket.answered &&
          apiConfig?.externalKey &&
          apiConfig?.urlMessageStatus
        ) {
          const payload = {
            timestamp: Date.now(),
            msg,
            messageId: msg.id.id,
            ticketId: ticket.id,
            externalKey: apiConfig?.externalKey,
            authToken: apiConfig?.authToken,
            type: "hookMessage"
          };
          Queue.add("WebHooksAPI", {
            url: apiConfig.urlMessageStatus,
            type: payload.type,
            payload
          });
        }

        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default HandleMessage;
