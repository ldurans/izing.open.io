import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import ShowStepAutoReplyMessageService from "../services/AutoReplyServices/ShowStepAutoReplyMessageService";
import CreateLogTicketService from "../services/TicketServices/CreateLogTicketService";

const AutoReplyWelcome = async (instance: Ticket): Promise<void> => {
  if (instance.userId || instance.isGroup) return;

  const stepAutoReply = await ShowStepAutoReplyMessageService(
    0,
    0,
    0,
    true,
    instance.tenantId
  );

  if (!stepAutoReply) return;

  const contato = await Contact.findByPk(instance.contactId);
  const { celularTeste } = stepAutoReply.autoReply;
  const celularContato = contato?.number;

  if (
    (celularTeste && celularContato?.indexOf(celularTeste.substr(1)) === -1) ||
    !celularContato
  ) {
    if (instance.channel !== "telegram") {
      return;
    }
  }

  await instance.update({
    autoReplyId: stepAutoReply.autoReply.id,
    stepAutoReplyId: stepAutoReply.id
  });

  await CreateLogTicketService({
    ticketId: instance.id,
    type: "chatBot"
  });
};

export default AutoReplyWelcome;
