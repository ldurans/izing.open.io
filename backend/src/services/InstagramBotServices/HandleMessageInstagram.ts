import { IgActionSpamError } from "instagram-private-api";
import { IgApiClientMQTT, MessageSyncMessageWrapper } from "instagram_mqtt";

import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
// import VerifyContact from "./InstagramVerifyContact";
// import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
// import VerifyMediaMessage from "./TelegramVerifyMediaMessage";
// import VerifyMessage from "./TelegramVerifyMessage";
// import verifyBusinessHours from "../WbotServices/helpers/VerifyBusinessHours";
// import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";

interface Session extends IgApiClientMQTT {
  id?: number;
}

const HandleMessage = async (
  ctx: MessageSyncMessageWrapper,
  instaBot: Session
): Promise<void> => {
  const channel = await ShowWhatsAppService(instaBot.id || "");
  // const { message } = ctx;
  // const chat = message.user_id;
  // const me = await ctx.message.item_id;
  // const fromMe = true; // me.id === ctx.message?.from.id;
  console.log(instaBot);
  console.log(await instaBot.account.currentUser());
  console.log(channel, ctx);
  // const contact = await VerifyContact(ctx, channel.tenantId);
  // const ticket = await FindOrCreateTicketService({
  //   contact,
  //   whatsappId: instaBot.id!,
  //   unreadMessages: fromMe ? 0 : 1,
  //   tenantId: channel.tenantId,
  //   msg: { ...message, fromMe },
  //   channel: "telegram"
  // });

  // if (!message?.text && chat?.id) {
  //   await VerifyMediaMessage(ctx, fromMe, ticket, contact);
  // } else {
  //   await VerifyMessage(ctx, fromMe, ticket, contact);
  // }

  // await VerifyStepsChatFlowTicket(
  //   {
  //     fromMe,
  //     body: message.text || ""
  //   },
  //   ticket
  // );

  // await verifyBusinessHours(
  //   {
  //     fromMe,
  //     timestamp: message.date
  //   },
  //   ticket
  // );

  // const unreadMessages = fromMe ? 0 : chat.unreadCount;

  // console.log("ctx", Context);
};

export default HandleMessage;
