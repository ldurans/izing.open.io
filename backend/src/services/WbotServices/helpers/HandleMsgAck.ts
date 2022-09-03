import { Message as WbotMessage, MessageAck } from "whatsapp-web.js";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import { logger } from "../../../utils/logger";
import CampaignContacts from "../../../models/CampaignContacts";
import ApiMessage from "../../../models/ApiMessage";
import socketEmit from "../../../helpers/socketEmit";
import Queue from "../../../libs/Queue";

const HandleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  try {
    const messageToUpdate = await Message.findOne({
      where: { messageId: msg.id.id },
      include: [
        "contact",
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId", "apiConfig"]
        },
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        }
      ]
    });

    if (messageToUpdate) {
      await messageToUpdate.update({ ack });
      const { ticket } = messageToUpdate;
      socketEmit({
        tenantId: ticket.tenantId,
        type: "chat:ack",
        payload: messageToUpdate
      });

      const apiConfig: any = ticket.apiConfig || {};
      if (apiConfig?.externalKey && apiConfig?.urlMessageStatus) {
        const payload = {
          ack,
          messageId: msg.id.id,
          ticketId: ticket.id,
          externalKey: apiConfig?.externalKey,
          authToken: apiConfig?.authToken,
          type: "hookMessageStatus"
        };
        Queue.add("WebHooksAPI", {
          url: apiConfig.urlMessageStatus,
          type: payload.type,
          payload
        });
      }
    }

    const messageAPI = await ApiMessage.findOne({
      where: { messageId: msg.id.id }
    });

    if (messageAPI) {
      await messageAPI.update({ ack });
    }

    const messageCampaign = await CampaignContacts.findOne({
      where: { messageId: msg.id.id }
    });

    if (messageCampaign) {
      await messageCampaign.update({ ack });
    }
  } catch (err) {
    logger.error(err);
  }
};

export default HandleMsgAck;
