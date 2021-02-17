import { Op } from "sequelize";
import Whatsapp from "../../models/Whatsapp";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
// import { StartTbotSession } from "../TbotServices/StartTbotSession";

export const StartAllWhatsAppsSessions = async (): Promise<void> => {
  const whatsapps = await Whatsapp.findAll({
    where: {
      status: {
        [Op.notIn]: ["DESTROYED", "qrcode"]
        // "DISCONNECTED"
      }
    }
  });
  const whatsappSessions = whatsapps.filter(w => w.type === "w");
  // const telegramSessions = whatsapps.filter(w => w.type === "t");

  if (whatsappSessions.length > 0) {
    whatsappSessions.forEach(whatsapp => {
      StartWhatsAppSession(whatsapp);
    });
  }

  // if (telegramSessions.length > 0) {
  //   telegramSessions.forEach(whatsapp => {
  //     StartTbotSession(whatsapp);
  //   });
  // }
};
