import { Op } from "sequelize";
import socketEmit from "../../helpers/socketEmit";
import Contact from "../../models/Contact";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import ShowTicketService from "../TicketServices/ShowTicketService";

interface Request {
  message: Message;
  contact: Contact;
  userId?: number | string;
  tenantId: string | number;
  ticketIdOrigin: number;
}

const CreateForwardMessageService = async ({
  userId,
  tenantId,
  message,
  contact,
  ticketIdOrigin
}: Request): Promise<void> => {
  const ticketOrigin = await ShowTicketService({
    id: ticketIdOrigin,
    tenantId
  });

  let ticket: Ticket | undefined | null;
  ticket = await Ticket.findOne({
    where: {
      status: {
        [Op.or]: ["open", "pending"]
      },
      tenantId,
      contactId: contact.id
    }
  });

  // caso não exista ticket aberto ou pendente
  if (!ticket) {
    ticket = await Ticket.create({
      contactId: contact.id,
      status: "open",
      isGroup: contact.isGroup,
      userId,
      tenantId,
      unreadMessages: 0,
      whatsappId: ticketOrigin.whatsappId,
      lastMessage: message.body,
      lastMessageAt: new Date().getTime(),
      answered: true
    });
  }

  // preparar dados para criação da mensagem
  const msgData = {
    body: message.body,
    contactId: contact.id,
    fromMe: true,
    read: true,
    mediaType: message?.mediaType,
    mediaUrl: message?.mediaName,
    mediaName: message?.mediaName,
    timestamp: new Date().getTime(),
    userId,
    scheduleDate: null,
    sendType: "chat",
    status: "pending",
    ticketId: ticket.id,
    tenantId
  };

  const msgCreated = await Message.create(msgData);

  const messageCreated = await Message.findByPk(msgCreated.id, {
    include: [
      {
        model: Ticket,
        as: "ticket",
        where: { tenantId },
        include: ["contact"]
      },
      {
        model: Message,
        as: "quotedMsg",
        include: ["contact"]
      }
    ]
  });

  if (!messageCreated) {
    // throw new AppError("ERR_CREATING_MESSAGE", 501);
    throw new Error("ERR_CREATING_MESSAGE_SYSTEM");
  }

  await ticket.update({
    lastMessage: messageCreated.body,
    lastMessageAt: new Date().getTime(),
    answered: true
  });

  socketEmit({
    tenantId,
    type: "chat:create",
    payload: messageCreated
  });
};

export default CreateForwardMessageService;
