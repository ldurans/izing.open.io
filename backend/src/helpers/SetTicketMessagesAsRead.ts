import { getIO } from "../libs/socket";
import Message from "../models/Message";
import Ticket from "../models/Ticket";
import { logger } from "../utils/logger";
import GetTicketWbot from "./GetTicketWbot";

const SetTicketMessagesAsRead = async (ticket: Ticket): Promise<void> => {
  await Message.update(
    { read: true },
    {
      where: {
        ticketId: ticket.id,
        read: false
      }
    }
  );

  await ticket.update({ unreadMessages: 0 });

  try {
    const wbot = await GetTicketWbot(ticket);
    wbot.sendSeen(`${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`);
  } catch (err) {
    logger.warn(
      `Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`
    );
    throw new Error("ERR_WAPP_NOT_INITIALIZED");
  }

  const io = getIO();
  io.to(`${ticket.tenantId}-${ticket.status}`)
    .to(`${ticket.tenantId}-notification`)
    .emit(`${ticket.tenantId}-ticket`, {
      action: "updateUnread",
      ticketId: ticket.id
    });
};

export default SetTicketMessagesAsRead;
