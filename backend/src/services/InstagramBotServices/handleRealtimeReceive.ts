/* eslint-disable camelcase */
import { AccountRepositoryLoginResponseLogged_in_user } from "instagram-private-api";
import { IgApiClientMQTT, MessageSyncMessageWrapper } from "instagram_mqtt";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import InstagramVerifyContact from "./InstagramVerifyContact";

interface Session extends IgApiClientMQTT {
  id?: number;
  accountLogin?: AccountRepositoryLoginResponseLogged_in_user;
}

const handleRealtimeReceive = async (
  ctx: MessageSyncMessageWrapper | any,
  instaBot: Session
) => {
  console.log(ctx);
  const channel = await ShowWhatsAppService(instaBot.id || "");
  const threadData = await instaBot.feed
    .directThread({ thread_id: ctx.message.thread_id, oldest_cursor: "" })
    .request();

  const contact = await InstagramVerifyContact(
    threadData,
    instaBot,
    channel.tenantId
  );

  const account = instaBot?.accountLogin;
  const fromMe = account?.pk === ctx.message.user_id;

  const ticket = await FindOrCreateTicketService({
    contact,
    whatsappId: instaBot.id!,
    unreadMessages: fromMe ? 0 : 1,
    tenantId: channel.tenantId,
    msg: { ...ctx.message, fromMe },
    channel: "instagram"
  });

  console.log(ticket);
};

export default handleRealtimeReceive;
