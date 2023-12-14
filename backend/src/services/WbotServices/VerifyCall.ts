import { Contact as WbotContact, Call, Client } from "whatsapp-web.js";
import { logger } from "../../utils/logger";
import FindOrCreateTicketService from "../TicketServices/FindOrCreateTicketService";
import Setting from "../../models/Setting";
import Whatsapp from "../../models/Whatsapp";
import Tenant from "../../models/Tenant";
import VerifyContact from "./helpers/VerifyContact";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
import SendMessagesSystemWbot from "./SendMessagesSystemWbot";

interface Session extends Client {
  id: number;
}

const VerifyCall = async (call: Call, wbot: Session): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    (async () => {
      const messageDefault =
        "As chamadas de voz e vídeo estão desabilitas para esse WhatsApp, favor enviar uma mensagem de texto.";
      let settings;

      try {
        const query = `
          select s."key", s.value, w."tenantId" from "Whatsapps" w
          inner join "Tenants" t on w."tenantId" = t.id
          inner join "Settings" s on t.id = s."tenantId"
          where w.id = '${wbot.id}'
          and s."key" in ('rejectCalls', 'callRejectMessage')
        `;
        settings = await Setting.sequelize?.query(query);
        if (settings?.length) {
          // eslint-disable-next-line prefer-destructuring
          settings = settings[0];
        }

        const rejectCalls =
          settings.find(s => s.key === "rejectCalls")?.value === "enabled" ||
          false;

        const callRejectMessage =
          settings.find(s => s.key === "callRejectMessage")?.value ||
          messageDefault;

        const tenantId = settings.find(s => s.key === "rejectCalls")?.tenantId;

        if (!rejectCalls) {
          resolve();
          return;
        }

        await call.reject();

        if (!call.from) return;

        const callContact: WbotContact | any = await wbot.getChatById(
          call.from
        );

        // const profilePicUrl = await msgContact.getProfilePicUrl();
        const contact = await VerifyContact(callContact, tenantId);
        const ticket = await FindOrCreateTicketService({
          contact,
          whatsappId: wbot.id!,
          unreadMessages: 1,
          tenantId,
          channel: "whatsapp"
        });

        // create message for call
        await CreateMessageSystemService({
          msg: {
            body: callRejectMessage,
            fromMe: true,
            read: true,
            sendType: "bot"
          },
          tenantId: ticket.tenantId,
          ticket,
          sendType: "call",
          status: "pending"
        });

        resolve();
      } catch (err) {
        logger.error(err);
        reject(err);
      }
    })();
  });
};

export default VerifyCall;
