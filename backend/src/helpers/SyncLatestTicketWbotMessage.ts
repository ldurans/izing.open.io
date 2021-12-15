// import { Message as WbotMessage } from "whatsapp-web.js";
// import { Op } from "sequelize";
// import Ticket from "../models/Ticket";
// import GetTicketWbot from "./GetTicketWbot";
// import AppError from "../errors/AppError";
// import { logger } from "../utils/logger";
// import Message from "../models/Message";

// export const SyncLatestTicketWbotMessage = async (
//   ticket: Ticket
// ): Promise<WbotMessage> => {
//   const wbot = await GetTicketWbot(ticket);

//   const wbotChat = await wbot.getChatById(
//     `${ticket.contact.number}@${ticket.isGroup ? "g" : "c"}.us`
//   );

//   const limit = 20;

//   try {
//     const chatMessages = await wbotChat.fetchMessages({ limit });

//     if (chatMessages) {
//       const ticketDateMessages = chatMessages.filter(
//         msg => msg.timestamp >= ticket.createdAt.getTime()
//       );

//       for (const msg of ticketDateMessages) {
//       }
//       // const idsMgs = ticketMessages.map(m => String(m.id));
//       // const messages = await Message.findAll({
//       //   where: {
//       //     contactId: ticket.contactId,
//       //     messageId: {
//       //       [Op.notIn]: idsMgs
//       //     }
//       //   },
//       //   limit: 20,
//       //   order: [["createdAt", "DESC"]]
//       // });
//       // const idsMessages = messages.map(m => m.messageId);
//     }
//   } catch (err) {
//     logger.error(err);
//     throw new AppError("ERR_FETCH_WAPP_MSG");
//   }
// };

// export default SyncLatestTicketWbotMessage;
