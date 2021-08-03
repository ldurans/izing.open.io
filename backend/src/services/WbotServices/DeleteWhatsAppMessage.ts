import AppError from "../../errors/AppError";
import GetWbotMessage from "../../helpers/GetWbotMessage";
import Message from "../../models/Message";
import Ticket from "../../models/Ticket";
import { StartWhatsAppSessionVerify } from "./StartWhatsAppSessionVerify";
import socketEmit from "../../helpers/socketEmit";

const DeleteWhatsAppMessage = async (
  id: string,
  messageId: string,
  tenantId: string | number
): Promise<void> => {
  if (!messageId || messageId === "null") {
    await Message.update(
      {
        isDeleted: true,
        status: "canceled"
      },
      { where: { id } }
    );
    const message = await Message.findByPk(id, {
      include: [
        {
          model: Ticket,
          as: "ticket",
          include: ["contact"],
          where: { tenantId }
        }
      ]
    });
    if (message) {
      socketEmit({
        tenantId,
        type: "chat:delete",
        payload: message
      });
    }
    return;
  }
  const message = await Message.findOne({
    where: { messageId },
    include: [
      {
        model: Ticket,
        as: "ticket",
        include: ["contact"],
        where: { tenantId }
      }
    ]
  });

  if (!message) {
    throw new AppError("No message found with this ID.");
  }

  const { ticket } = message;

  const messageToDelete = await GetWbotMessage(ticket, messageId);

  try {
    await messageToDelete.delete(true);
  } catch (err) {
    StartWhatsAppSessionVerify(ticket.whatsappId, err);
    throw new AppError("ERR_DELETE_WAPP_MSG");
  }

  await message.update({ isDeleted: true });

  socketEmit({
    tenantId: ticket.tenantId,
    type: "chat:delete",
    payload: message
  });
};

export default DeleteWhatsAppMessage;
