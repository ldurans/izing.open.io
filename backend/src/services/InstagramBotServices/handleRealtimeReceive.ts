/* eslint-disable camelcase */
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user
} from "instagram-private-api";
import { IgApiClientMQTT, MessageSyncMessageWrapper } from "instagram_mqtt";
import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import verifyBusinessHours from "../WbotServices/helpers/VerifyBusinessHours";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import InstagramVerifyContact from "./InstagramVerifyContact";
import VerifyMediaMessage from "./InstagramVerifyMediaMessage";
import VerifyMessage from "./InstagramVerifyMessage";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
    | AccountRepositoryLoginResponseLogged_in_user
    | AccountRepositoryCurrentUserResponseUser;
}

const handleRealtimeReceive = async (
  ctx: MessageSyncMessageWrapper | any,
  instaBot: Session
) => {
  const channel = await ShowWhatsAppService({ id: instaBot.id });
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

  if (ticket?.isFarewellMessage) {
    return;
  }

  if (ctx.message.item_type !== "text") {
    await VerifyMediaMessage(ctx, fromMe, ticket, contact);
  } else {
    await VerifyMessage(ctx, fromMe, ticket, contact);
  }

  // marcar como lida
  const entity = await instaBot.entity.directThread(ctx.message.thread_id);
  entity.markItemSeen(ctx.message.item_id);

  await VerifyStepsChatFlowTicket(
    {
      fromMe,
      body: ctx.message?.text || ""
    },
    ticket
  );

  await verifyBusinessHours(
    {
      fromMe,
      timestamp: ctx.message.timestamp / 1000 // adequar horário node
    },
    ticket
  );
};

export default handleRealtimeReceive;
