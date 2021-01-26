import {
  Contact as WbotContact,
  Message as WbotMessage,
  Client
} from "whatsapp-web.js";
import * as Sentry from "@sentry/node";
import Contact from "../../../models/Contact";
import { logger } from "../../../utils/logger";
import FindOrCreateTicketService from "../../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../../WhatsappService/ShowWhatsAppService";
import IsValidMsg from "./IsValidMsg";
import VerifyAutoReplyActionTicket from "./VerifyAutoReplyActionTicket";
import VerifyContact from "./VerifyContact";
import VerifyMediaMessage from "./VerifyMediaMessage";
import VerifyMessage from "./VerifyMessage";

interface Session extends Client {
  id?: number;
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
      let whatsapp;

      try {
        let msgContact: WbotContact;
        let groupContact: Contact | undefined;

        whatsapp = await ShowWhatsAppService(wbot.id || "");

        const { tenantId } = whatsapp;

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

        const chat = await msg.getChat();

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
        const ticket = await FindOrCreateTicketService(
          contact,
          wbot.id!,
          unreadMessages,
          tenantId,
          groupContact
        );

        if (msg.hasMedia) {
          await VerifyMediaMessage(msg, ticket, contact);
        } else {
          await VerifyMessage(msg, ticket, contact);
        }
        await VerifyAutoReplyActionTicket(msg, ticket);
        resolve();
      } catch (err) {
        Sentry.captureException(err);
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default HandleMessage;
