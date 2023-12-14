import { Client } from "whatsapp-web.js";
import Queue from "../../libs/Queue";
import { logger } from "../../utils/logger";
import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import VerifyContact from "./helpers/VerifyContact";
import VerifyMediaMessage from "./helpers/VerifyMediaMessage";
import VerifyMessage from "./helpers/VerifyMessage";

interface Session extends Client {
  id?: number;
}

const SyncUnreadMessagesWbot = async (
  wbot: Session,
  tenantId: number | string
): Promise<void> => {
  try {
    const chats = await wbot.getChats();
    await Promise.all(
      chats.map(async chat => {
        if (chat.unreadCount > 0) {
          const unreadMessages = await chat.fetchMessages({
            limit: chat.unreadCount
          });
          logger.info(`CHAT: ${chat}`);

          if (chat.isGroup) {
            return;
          }
          const chatContact = await chat.getContact();
          const contact = await VerifyContact(chatContact, tenantId);
          const ticket = await FindOrCreateTicketService({
            contact,
            whatsappId: wbot.id!,
            unreadMessages: chat.unreadCount,
            tenantId,
            isSync: true,
            channel: "whatsapp"
          });

          if (ticket?.isCampaignMessage) {
            return;
          }

          if (ticket?.isFarewellMessage) {
            return;
          }

          unreadMessages.map(async (msg, idx) => {
            logger.info(`MSG: ${msg}`, msg.id?.id);
            if (msg.hasMedia) {
              await VerifyMediaMessage(msg, ticket, contact);
            } else {
              await VerifyMessage(msg, ticket, contact);
            }
            // enviar mensagem do bot na ultima mensagem
            if (idx === unreadMessages.length - 1) {
              await VerifyStepsChatFlowTicket(msg, ticket);

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
            }
          });
        }
      })
    );
  } catch (error) {
    logger.error("Erro ao syncronizar mensagens", error);
  }
};

export default SyncUnreadMessagesWbot;
