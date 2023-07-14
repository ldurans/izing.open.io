import { Telegraf } from "telegraf";
import { getTbot } from "../libs/tbot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";


interface Session extends Telegraf {
    id: number;
  }
  
const GetTicketTbot = async (ticket: Ticket): Promise<Session> => {
  if (!ticket.whatsappId) {
   const defaultWhatsapp = await GetDefaultWhatsApp(ticket.tenantId,ticket.channel);
   await ticket.$set("whatsapp", defaultWhatsapp);
  }

  const tbot = getTbot(ticket.whatsappId);

  return tbot;
}

export default GetTicketTbot;