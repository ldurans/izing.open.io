import { Context, Telegraf } from "telegraf";
import ShowWhatsAppService from "../WhatsappService/ShowWhatsAppService";
import VerifyContact from "./TelegramVerifyContact";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import VerifyMediaMessage from "./TelegramVerifyMediaMessage";
import VerifyMessage from "./TelegramVerifyMessage";
import verifyBusinessHours from "../WbotServices/helpers/VerifyBusinessHours";
import VerifyStepsChatFlowTicket from "../ChatFlowServices/VerifyStepsChatFlowTicket";

interface Session extends Telegraf {
  id: number;
}

const HandleMessage = async (ctx: Context, tbot: Session): Promise<void> => {
  const channel = await ShowWhatsAppService({ id: tbot.id });
  const { message }: any = ctx;
  const chat = message?.chat;
  const me = await ctx.telegram.getMe();
  const fromMe = me.id === ctx.message?.from.id;

  const contact = await VerifyContact(ctx, channel.tenantId);
  const ticket = await FindOrCreateTicketService({
    contact,
    whatsappId: tbot.id!,
    unreadMessages: fromMe ? 0 : 1,
    tenantId: channel.tenantId,
    msg: { ...message, fromMe },
    channel: "telegram"
  });

  if (!message?.text && chat?.id) {
    await VerifyMediaMessage(ctx, fromMe, ticket, contact);
  } else {
    await VerifyMessage(ctx, fromMe, ticket, contact);
  }

  await VerifyStepsChatFlowTicket(
    {
      fromMe,
      body: message.text || ""
    },
    ticket
  );

  await verifyBusinessHours(
    {
      fromMe,
      timestamp: message.date
    },
    ticket
  );

  // const unreadMessages = fromMe ? 0 : chat.unreadCount;

  // console.log("ctx", Context);
};

export default HandleMessage;
