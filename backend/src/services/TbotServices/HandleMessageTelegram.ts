import { Context, Telegraf } from "telegraf";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import VerifyContact from "./TelegramVerifyContact";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import VerifyMediaMessage from "./TelegramVerifyMediaMessage";

interface Session extends Telegraf {
  id?: number;
}

const HandleMessage = async (ctx: Context, tbot: Session): Promise<void> => {
  console.log("tbot", tbot);
  const channel = await ShowWhatsAppService(tbot.id || "");
  const { message } = ctx;
  const chat = message?.chat;
  const me = await ctx.telegram.getMe();
  const fromMe = me.id === ctx.message?.from.id;
  console.log("me", me, fromMe);

  const contact = await VerifyContact(ctx, channel.tenantId);
  const ticket = await FindOrCreateTicketService({
    contact,
    whatsappId: tbot.id!,
    unreadMessages: fromMe ? 0 : 1,
    tenantId: channel.tenantId,
    msg: { ...message, fromMe }
  });

  if (!message?.text && chat?.id) {
    await VerifyMediaMessage(ctx, fromMe, ticket, contact);
  } else {
    // await VerifyMessage(msg, ticket, contact);
  }

  // await VerifyAutoReplyActionTicket(msg, ticket);

  // await verifyBusinessHours(msg, ticket);

  // const unreadMessages = fromMe ? 0 : chat.unreadCount;

  // console.log("ctx", Context);
};

export default HandleMessage;
