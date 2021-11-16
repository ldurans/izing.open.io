import { Message as WbotMessage } from "whatsapp-web.js";
import socketEmit from "../../../helpers/socketEmit";
// import SetTicketMessagesAsRead from "../../../helpers/SetTicketMessagesAsRead";
import Ticket from "../../../models/Ticket";
// import { sleepRandomTime } from "../../../utils/sleepRandomTime";
import CreateAutoReplyLogsService from "../../AutoReplyServices/CreateAutoReplyLogsService";
import ShowStepAutoReplyMessageService from "../../AutoReplyServices/ShowStepAutoReplyMessageService";
import VerifyActionStepAutoReplyService from "../../AutoReplyServices/VerifyActionStepAutoReplyService";
import CreateMessageSystemService from "../../MessageServices/CreateMessageSystemService";
import CreateLogTicketService from "../../TicketServices/CreateLogTicketService";
// import SendWhatsAppMessage from "../SendWhatsAppMessage";

const verifyAutoReplyActionTicket = async (
  msg: WbotMessage | any,
  ticket: Ticket
): Promise<void> => {
  const celularContato = ticket.contact.number;
  let celularTeste = "";

  if (
    ticket.autoReplyId &&
    ticket.status === "pending" &&
    !msg.fromMe &&
    !ticket.isGroup
  ) {
    if (ticket.autoReplyId) {
      const stepAutoReplyAtual = await ShowStepAutoReplyMessageService(
        0,
        ticket.autoReplyId,
        ticket.stepAutoReplyId,
        undefined,
        ticket.tenantId
      );
      const actionAutoReply = await VerifyActionStepAutoReplyService(
        ticket.stepAutoReplyId,
        msg.body,
        ticket.tenantId
      );
      if (actionAutoReply) {
        await CreateAutoReplyLogsService(stepAutoReplyAtual, ticket, msg.body);

        // action = 0: enviar para proximo step: nextStepId
        if (actionAutoReply.action === 0) {
          await ticket.update({
            stepAutoReplyId: actionAutoReply.nextStepId
          });
          const stepAutoReply = await ShowStepAutoReplyMessageService(
            0,
            ticket.autoReplyId,
            actionAutoReply.nextStepId,
            undefined,
            ticket.tenantId
          );

          // Verificar se rotina em teste
          celularTeste = stepAutoReply.autoReply.celularTeste;
          if (
            (celularTeste &&
              celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
            !celularContato
          ) {
            if (ticket.channel !== "telegram") {
              return;
            }
            // return;
          }

          const messageData = {
            body: stepAutoReply.reply,
            fromMe: true,
            read: true,
            sendType: "bot"
          };
          await CreateMessageSystemService({
            msg: messageData,
            tenantId: ticket.tenantId,
            ticket,
            sendType: messageData.sendType,
            status: "pending"
          });
          // await SetTicketMessagesAsRead(ticket);
          return;
        }

        // action = 1: enviar para fila: queue
        if (actionAutoReply.action === 1) {
          ticket.update({
            queueId: actionAutoReply.queueId,
            autoReplyId: null,
            stepAutoReplyId: null
          });

          await CreateLogTicketService({
            ticketId: ticket.id,
            type: "queue",
            queueId: actionAutoReply.queueId
          });
        }

        // action = 2: enviar para determinado usuário
        if (actionAutoReply.action === 2) {
          ticket.update({
            userId: actionAutoReply.userIdDestination,
            // status: "pending",
            autoReplyId: null,
            stepAutoReplyId: null
          });
          await CreateLogTicketService({
            userId: actionAutoReply.userIdDestination,
            ticketId: ticket.id,
            type: "userDefine"
          });
        }

        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });

        if (actionAutoReply.replyDefinition) {
          const messageData = {
            body: actionAutoReply.replyDefinition,
            fromMe: true,
            read: true,
            sendType: "bot"
          };
          await CreateMessageSystemService({
            msg: messageData,
            tenantId: ticket.tenantId,
            ticket,
            sendType: messageData.sendType,
            status: "pending"
          });
          // await SetTicketMessagesAsRead(ticket);
        }
      } else {
        // Verificar se rotina em teste
        celularTeste = stepAutoReplyAtual.autoReply.celularTeste;
        if (
          (celularTeste &&
            celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
          !celularContato
        ) {
          if (ticket.channel !== "telegram") {
            return;
          }
          // return;
        }

        // se ticket tiver sido criado, ingnorar na primeria passagem
        if (!ticket.isCreated) {
          const messageData = {
            body: "Desculpe! Não entendi sua resposta. Vamos tentar novamente! Escolha uma opção válida.",
            fromMe: true,
            read: true,
            sendType: "bot"
          };
          await CreateMessageSystemService({
            msg: messageData,
            tenantId: ticket.tenantId,
            ticket,
            sendType: messageData.sendType,
            status: "pending"
          });
        }

        const messageData = {
          body: stepAutoReplyAtual.reply,
          fromMe: true,
          read: true,
          sendType: "bot"
        };
        await CreateMessageSystemService({
          msg: messageData,
          tenantId: ticket.tenantId,
          ticket,
          sendType: messageData.sendType,
          status: "pending"
        });
        // await SetTicketMessagesAsRead(ticket);
      }
    }
  }
};

export default verifyAutoReplyActionTicket;
