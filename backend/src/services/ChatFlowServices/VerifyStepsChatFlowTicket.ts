import { Message as WbotMessage } from "whatsapp-web.js";
import socketEmit from "../../helpers/socketEmit";
// import SetTicketMessagesAsRead from "../../../helpers/SetTicketMessagesAsRead";
import Ticket from "../../models/Ticket";
// import { sleepRandomTime } from "../../../utils/sleepRandomTime";
// import CreateAutoReplyLogsService from "../AutoReplyServices/CreateAutoReplyLogsService";
import CreateMessageSystemService from "../MessageServices/CreateMessageSystemService";
import CreateLogTicketService from "../TicketServices/CreateLogTicketService";
import BuildSendMessageService from "./BuildSendMessageService";
// import SendWhatsAppMessage from "../SendWhatsAppMessage";

const VerifyStepsChatFlowTicket = async (
  msg: WbotMessage | any,
  ticket: Ticket | any
): Promise<void> => {
  const celularContato = ticket.contact.number;
  let celularTeste; // ticket.chatFlow?.celularTeste;

  if (
    ticket.chatFlowId &&
    ticket.status === "pending" &&
    !msg.fromMe &&
    !ticket.isGroup &&
    !ticket.answered
  ) {
    if (ticket.chatFlowId) {
      const chatFlow = await ticket.getChatFlow();
      celularTeste = chatFlow.celularTeste; // ticket.chatFlow?.celularTeste;

      const step = chatFlow.flow.nodeList.find(
        (node: any) => node.id === ticket.stepChatFlow
      );

      const exceptionsConfig = chatFlow.flow.nodeList.find(
        (node: any) => node.type === "exception"
      );

      // verificar condição com a ação do step
      const stepCondition = step.conditions.find((conditions: any) => {
        const newConditions = conditions.condition.map((c: any) =>
          String(c).toLowerCase()
        );
        const message = String(msg.body).toLowerCase();
        return newConditions.includes(message);
      });

      if (stepCondition) {
        // await CreateAutoReplyLogsService(stepAutoReplyAtual, ticket, msg.body);

        // action = 0: enviar para proximo step: nextStepId
        if (stepCondition.action === 0) {
          await ticket.update({
            stepChatFlow: stepCondition.nextStepId
          });

          // Verificar se rotina em teste
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

          for (const interaction of step.interactions) {
            await BuildSendMessageService({
              msg: interaction,
              tenantId: ticket.tenantId,
              ticket
            });
          }
          // await SetTicketMessagesAsRead(ticket);
        }

        // action = 1: enviar para fila: queue
        if (stepCondition.action === 1) {
          ticket.update({
            queueId: stepCondition.queueId,
            chatFlowId: null,
            stepChatFlow: null
          });

          await CreateLogTicketService({
            ticketId: ticket.id,
            type: "queue",
            queueId: stepCondition.queueId
          });
        }

        // action = 2: enviar para determinado usuário
        if (stepCondition.action === 2) {
          ticket.update({
            userId: stepCondition.userIdDestination,
            // status: "pending",
            chatFlowId: null,
            stepChatFlow: null
          });
          await CreateLogTicketService({
            userId: stepCondition.userIdDestination,
            ticketId: ticket.id,
            type: "userDefine"
          });
        }

        socketEmit({
          tenantId: ticket.tenantId,
          type: "ticket:update",
          payload: ticket
        });
      } else {
        // if (exceptionsConfig.configurations.welcomeMessage.message) {
        //   const messageData = {
        //     body: exceptionsConfig.configurations.welcomeMessage.message,
        //     fromMe: true,
        //     read: true,
        //     sendType: "bot"
        //   };
        //   await CreateMessageSystemService({
        //     msg: messageData,
        //     tenantId: ticket.tenantId,
        //     ticket,
        //     sendType: messageData.sendType,
        //     status: "pending"
        //   });
        //   // await SetTicketMessagesAsRead(ticket);
        // }

        // Verificar se rotina em teste
        celularTeste = chatFlow.celularTeste;
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
            body:
              exceptionsConfig.configurations.notOptionsSelectMessage.message ||
              "Desculpe! Não entendi sua resposta. Vamos tentar novamente! Escolha uma opção válida.",
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

        for (const interaction of step.interactions) {
          await BuildSendMessageService({
            msg: interaction,
            tenantId: ticket.tenantId,
            ticket
          });
        }
        // await SetTicketMessagesAsRead(ticket);
        // await SetTicketMessagesAsRead(ticket);
      }
    }
  }
};

export default VerifyStepsChatFlowTicket;
