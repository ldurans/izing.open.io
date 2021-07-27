import { Message as WbotMessage, MessageAck } from "whatsapp-web.js";
import * as Sentry from "@sentry/node";
import { getIO } from "../../../libs/socket";
import Message from "../../../models/Message";
import Ticket from "../../../models/Ticket";
import { logger } from "../../../utils/logger";
import CampaignContacts from "../../../models/CampaignContacts";
import ApiMessage from "../../../models/ApiMessage";

const HandleMsgAck = async (msg: WbotMessage, ack: MessageAck) => {
  await new Promise(r => setTimeout(r, 500));

  const io = getIO();

  try {
    const messageToUpdate = await Message.findOne({
      where: { messageId: msg.id.id },
      include: [
        "contact",
        {
          model: Message,
          as: "quotedMsg",
          include: ["contact"]
        },
        {
          model: Ticket,
          as: "ticket",
          attributes: ["id", "tenantId"]
        }
      ]
    });

    if (messageToUpdate) {
      await messageToUpdate.update({ ack });
      const { ticket } = messageToUpdate;
      io.to(`${ticket.tenantId}-${ticket.id.toString()}`).emit(
        `${ticket.tenantId}-appMessage`,
        {
          action: "update",
          message: messageToUpdate
        }
      );
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
    Sentry.captureException(err);
    logger.error(err);
  }
};

export default HandleMsgAck;
