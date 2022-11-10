/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
import { Op } from "sequelize";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { logger } from "../../utils/logger";
import Contact from "../../models/Contact";
// import SetTicketMessagesAsRead from "../../helpers/SetTicketMessagesAsRead";

const SendMessagesSchenduleWbot = async (): Promise<void> => {
  const where = {
    fromMe: true,
    messageId: { [Op.is]: null },
    status: "pending",
    scheduleDate: {
      [Op.lte]: new Date()
    }
  };
  const messages = await Message.findAll({
    where,
    include: [
      {
        model: Contact,
        as: "contact",
        where: {
          number: {
            [Op.notIn]: ["", "null"]
          }
        }
      },
      {
        model: Ticket,
        as: "ticket",
        where: {
          channel: "whatsapp"
        },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ],
    order: [["createdAt", "ASC"]]
  });

  for (const message of messages) {
    logger.info(
      `Message Schendule Queue: ${message.id} | Tenant: ${message.tenantId} `
    );
    global.rabbitWhatsapp.publishInQueue(
      `whatsapp::${message.tenantId}`,
      JSON.stringify({
        ...message.toJSON(),
        contact: message.ticket.contact.toJSON()
      })
    );
    message.update({ status: "queue" });
  }
};

export default SendMessagesSchenduleWbot;
