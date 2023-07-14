//import { Client as Session } from "whatsapp-we
import {
    AccountRepositoryCurrentUserResponseUser,
    AccountRepositoryLoginResponseLogged_in_user,
    IgApiClient
    // IgLoginTwoFactorRequiredError
  } from "instagram-private-api";
import { IgApiClientMQTT, withFbnsAndRealtime } from "instagram_mqtt";
import { getInstaBot } from "../libs/InstaBot";
import GetDefaultWhatsApp from "./GetDefaultWhatsApp";
import Ticket from "../models/Ticket";

interface Session extends IgApiClientMQTT {
    id: number;
    accountLogin?:
    | AccountRepositoryLoginResponseLogged_in_user
    | AccountRepositoryCurrentUserResponseUser;
  }
  

const GetTicketInstaBot = async (ticket: Ticket): Promise<Session> => {
  if (!ticket.whatsappId) {
    const defaultWhatsapp = await GetDefaultWhatsApp(ticket.tenantId,ticket.channel);

    await ticket.$set("whatsapp", defaultWhatsapp);
  }

  const Instabot = getInstaBot(ticket.whatsappId);

  return Instabot;
};

export default GetTicketInstaBot;
