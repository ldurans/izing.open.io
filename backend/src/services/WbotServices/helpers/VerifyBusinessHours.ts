import { Message as WbotMessage } from "whatsapp-web.js";
import { fromUnixTime, parse, isWithinInterval } from "date-fns";
// import { getIO } from "../../../libs/socket";
// import SetTicketMessagesAsRead from "../../../helpers/SetTicketMessagesAsRead";
// import SendWhatsAppMessage from "../SendWhatsAppMessage";
// import Queue from "../../../libs/Queue";
import Ticket from "../../../models/Ticket";
import ShowBusinessHoursAndMessageService from "../../TenantServices/ShowBusinessHoursAndMessageService";
import CreateMessageSystemService from "../../MessageServices/CreateMessageSystemService";
// import { sleepRandomTime } from "../../../utils/sleepRandomTime";

const verifyBusinessHours = async (
  msg: WbotMessage | any,
  ticket: Ticket
): Promise<boolean> => {
  let isBusinessHours = true;
  // Considerar o envio da mensagem de ausência se:
  // Ticket não está no fluxo de autoresposta
  // Ticket não estiver fechado
  // Mensagem não enviada por usuário via sistema
  // Não é um ticket referente a um grupo do whatsapp
  if (ticket.status !== "closed" && !msg.fromMe && !ticket.isGroup) {
    const tenant = await ShowBusinessHoursAndMessageService({
      tenantId: ticket.tenantId
    });

    const dateMsg = fromUnixTime(msg.timestamp);
    const businessDay: any = tenant.businessHours.find(
      (d: any) => d.day === dateMsg.getDay()
    );

    // Não existir configuração para a data, não deverá enviar
    // mensagem de ausencia
    if (!businessDay) return isBusinessHours;

    // Se o tipo for "O" open - significa que o estabelecimento
    // funciona o dia inteiro e deve desconsiderar o envio de mensagem de ausência
    if (businessDay.type === "O") return isBusinessHours;

    // verificar se data da mensagem está dendo do primerio período de tempo
    const isHoursFistInterval = isWithinInterval(dateMsg, {
      start: parse(businessDay.hr1, "HH:mm", new Date()),
      end: parse(businessDay.hr2, "HH:mm", new Date())
    });

    // verificar se data da mensagem está dendo do segundo período de tempo
    const isHoursLastInterval = isWithinInterval(dateMsg, {
      start: parse(businessDay.hr3, "HH:mm", new Date()),
      end: parse(businessDay.hr4, "HH:mm", new Date())
    });

    // se o tipo for C - Closed significa que o estabelecimento está
    // fechado o dia inteiro ou se a data/hora da mensagens estiver
    // fora dos horários de funcionamento da empresa, a mensagem deverá
    // ser enviada.
    if (
      businessDay.type === "C" ||
      (!isHoursFistInterval && !isHoursLastInterval)
    ) {
      // await sleepRandomTime({
      //   minMilliseconds: +(process.env.MIN_SLEEP_BUSINESS_HOURS || 10000),
      //   maxMilliseconds: +(process.env.MAX_SLEEP_BUSINESS_HOURS || 20000)
      // });
      // await SendWhatsAppMessage({
      //   body: tenant.messageBusinessHours,
      //   ticket,
      //   quotedMsg: undefined
      // });
      isBusinessHours = false;
      const messageData = {
        body: tenant.messageBusinessHours,
        fromMe: true,
        read: true,
        sendType: "bot",
        tenantId: ticket.tenantId
      };
      await CreateMessageSystemService({
        msg: messageData,
        tenantId: ticket.tenantId,
        ticket,
        sendType: messageData.sendType,
        status: "pending"
      });
    }
  }
  return isBusinessHours;
};

export default verifyBusinessHours;
