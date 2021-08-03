import Contact from "../models/Contact";
import Ticket from "../models/Ticket";
import ShowStepAutoReplyMessageService from "../services/AutoReplyServices/ShowStepAutoReplyMessageService";

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
    return;
  }

  await instance.update({
    autoReplyId: stepAutoReply.autoReply.id,
    stepAutoReplyId: stepAutoReply.id
  });
};

export default AutoReplyWelcome;
