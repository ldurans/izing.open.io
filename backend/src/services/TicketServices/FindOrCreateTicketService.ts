// import { subHours } from "date-fns";
import { Op } from "sequelize";
import Contact from "../../models/Contact";
import Ticket from "../../models/Ticket";
import User from "../../models/User";
import ShowTicketService from "./ShowTicketService";

const FindOrCreateTicketService = async (
  contact: Contact,
  whatsappId: number,
  unreadMessages: number,
  tenantId: number | string,
  groupContact?: Contact
): Promise<Ticket> => {
  let ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      tenantId,
      contactId: groupContact ? groupContact.id : contact.id
    },
    include: [
      "contact",
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profile"]
      }
    ]
  });

  if (ticket) {
    await ticket.update({ unreadMessages });

    return ticket;
  }

  if (groupContact) {
    ticket = await Ticket.findOne({
      where: {
        contactId: groupContact.id,
        tenantId
      },
      order: [["updatedAt", "DESC"]],
      include: ["contact"]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
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
        "contact",
        {
          model: User,
          as: "user",
          attributes: ["id", "name", "profile"]
        }
      ]
    });

    if (ticket) {
      await ticket.update({
        status: "pending",
        userId: null,
        unreadMessages
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
  return ticket;
};

export default FindOrCreateTicketService;
