import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import Setting from "../models/Setting";
import ChatFlow from "../models/ChatFlow";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";
import IsContactTest from "../services/ChatFlowServices/IsContactTest";

const CheckChatBotFlowWelcome = async (instance: Ticket): Promise<void> => {
  if (instance.userId || instance.isGroup) return;

  const setting = await Setting.findOne({
    where: {
      key: "botTicketActive",
      tenantId: instance.tenantId
    }
  });

  if (!setting || !setting.value) return;

  const chatFlow = await ChatFlow.findOne({
    where: {
      id: +setting?.value,
      tenantId: instance.tenantId
    }
  });

  if (!chatFlow) return;

  const contato = await Contact.findByPk(instance.contactId);
  const { celularTeste } = chatFlow;
  const celularContato = contato?.number;

  if (await IsContactTest(celularContato, celularTeste, instance.channel))
    return;

  const lineFlow = chatFlow.flow.lineList.find(
    (line: any) => line.from === "start"
  );

  await instance.update({
    chatFlowId: chatFlow.id,
    stepChatFlow: lineFlow.to,
    lastInteractionBot: new Date()
  });

  await CreateLogTicketService({
    ticketId: instance.id,
    type: "chatBot"
  });
};

export default CheckChatBotFlowWelcome;
