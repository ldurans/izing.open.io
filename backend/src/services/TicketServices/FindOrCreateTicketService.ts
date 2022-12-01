// import { subHours } from "date-fns";
import { Op } from "sequelize";
import { Message } from "whatsapp-web.js";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import ShowTicketService from "./ShowTicketService";
import CampaignContacts from "../../models/CampaignContacts";
import socketEmit from "../../helpers/socketEmit";
// import CheckChatBotWelcome from "../../helpers/CheckChatBotWelcome";
import CheckChatBotFlowWelcome from "../../helpers/CheckChatBotFlowWelcome";
import CreateLogTicketService from "./CreateLogTicketService";

interface Data {
  contact: Contact;
  whatsappId: number;
  unreadMessages: number;
  tenantId: number | string;
  groupContact?: Contact;
  msg?: Message | any;
  isSync?: boolean;
  channel: string;
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  unreadMessages,
  tenantId,
  groupContact,
  msg,
  isSync,
  channel
}: Data): Promise<Ticket | any> => {
  // se for uma mensagem de campanha, não abrir tícket
  if (msg && msg.fromMe) {
    const msgCampaign = await CampaignContacts.findOne({
      where: {
        contactId: contact.id,
        messageId: msg.id?.id || msg.message_id || msg.item_id
      }
    });
    if (msgCampaign?.id) {
      return { isCampaignMessage: true };
    }
  }

  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      tenantId,
      whatsappId,
      contactId: groupContact ? groupContact.id : contact.id
    },
    include: [
      {
        model: Contact,
        as: "contact",
        include: [
          "extraInfo",
          "tags",
          {
            association: "wallets",
            attributes: ["id", "name"]
          }
        ]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name"]
      }
    ]
  });

  if (ticket) {
    unreadMessages =
      ["telegram", "waba", "instagram", "messenger"].includes(channel) &&
        unreadMessages > 0
        ? (unreadMessages += ticket.unreadMessages)
        : unreadMessages;
    await ticket.update({ unreadMessages });
    socketEmit({
      tenantId,
      type: "ticket:update",
      payload: ticket
    });
    return ticket;
  }

  if (groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        tenantId,
        whatsappId
      },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: Contact,
          as: "contact",
          include: [
            "extraInfo",
            "tags",
            {
              association: "wallets",
              attributes: ["id", "name"]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"]
        }
      ]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });

      socketEmit({
        tenantId,
        type: "ticket:update",
        payload: ticket
      });

      return ticket;
    }
  } else {
    ticket = await Ticket.findOne({
      where: {
        // updatedAt: {
        //   [Op.between]: [+subHours(new Date(), 24), +new Date()]
        // },
        status: {
          [Op.in]: ["open", "pending"]
        },
        tenantId,
        whatsappId,
        contactId: contact.id
      },
      order: [["updatedAt", "DESC"]],
      include: [
        {
          model: Contact,
          as: "contact",
          include: [
            "extraInfo",
            "tags",
            {
              association: "wallets",
              attributes: ["id", "name"]
            }
          ]
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "name"]
        }
      ]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
      });

      socketEmit({
        tenantId,
        type: "ticket:update",
        payload: ticket
      });

      return ticket;
    }
  }

  const ticketCreated = await Ticket.create({
    contactId: groupContact ? groupContact.id : contact.id,
    status: "pending",
    isGroup: !!groupContact,
    unreadMessages,
    whatsappId,
    tenantId,
    channel
  });

  await CreateLogTicketService({
    ticketId: ticketCreated.id,
    type: "create"
  });

  if ((msg && !msg.fromMe) || isSync) {
    await CheckChatBotFlowWelcome(ticketCreated);
  }

  ticket = await ShowTicketService({ id: ticketCreated.id, tenantId });
  ticket.setDataValue("isCreated", true);

  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return ticket;
};

export default FindOrCreateTicketService;
