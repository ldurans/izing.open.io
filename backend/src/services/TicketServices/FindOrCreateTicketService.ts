// import { subHours } from "date-fns";
import { Op } from "sequelize";
import { Message } from "whatsapp-web.js";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import ShowTicketService from "./ShowTicketService";
import CampaignContacts from "../../models/CampaignContacts";
import socketEmit from "../../helpers/socketEmit";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  tenantId: number | string,
  groupContact?: Contact,
  msg?: Message
  // eslint-disable-next-line @typescript-eslint/ban-types
): Promise<Ticket | any> => {
  // se for uma mensagem de campanha, não abrir tícket
  if (msg && msg.fromMe) {
    const msgCampaign = await CampaignContacts.findOne({
      where: { contactId: contact.id, messageId: msg.id.id }
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
        tenantId
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
        userId: "1212",
        tenantId,
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

  const { id } = await Ticket.create({
    contactId: groupContact ? groupContact.id : contact.id,
    status: "pending",
    isGroup: !!groupContact,
    unreadMessages,
    whatsappId,
    tenantId
  });

  ticket = await ShowTicketService({ id, tenantId });
  ticket.setDataValue("isCreated", true);

  socketEmit({
    tenantId,
    type: "ticket:update",
    payload: ticket
  });

  return ticket;
};

export default FindOrCreateTicketService;
