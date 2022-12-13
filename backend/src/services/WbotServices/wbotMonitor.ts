import { Client } from "whatsapp-web.js";

import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { StartWhatsAppSession } from "./StartWhatsAppSession";
// import { apagarPastaSessao } from "../../libs/wbot";

interface Session extends Client {
  id?: number;
}

const wbotMonitor = async (
  wbot: Session,
  whatsapp: Whatsapp
): Promise<void> => {
  const io = getIO();
  const sessionName = whatsapp.name;

  try {
    wbot.on("change_state", async newState => {
      logger.info(`Monitor session: ${sessionName} - NewState: ${newState}`);
      try {
        await whatsapp.update({ status: newState });
      } catch (err) {
        logger.error(err);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("change_battery", async batteryInfo => {
      const { battery, plugged } = batteryInfo;
      logger.info(
        `Battery session: ${sessionName} ${battery}% - Charging? ${plugged}`
      );

      if (battery <= 20 && !plugged) {
        io.emit(`${whatsapp.tenantId}:change_battery`, {
          action: "update",
          batteryInfo: {
            ...batteryInfo,
            sessionName
          }
        });
      }

      try {
        await whatsapp.update({ battery, plugged });
      } catch (err) {
        logger.error(err);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    });

    wbot.on("disconnected", async reason => {
      logger.info(`Disconnected session: ${sessionName} | Reason: ${reason}`);
      try {
        await whatsapp.update({
          status: "OPENING",
          session: "",
          qrcode: null
        });
        // await apagarPastaSessao(whatsapp.id);
        setTimeout(() => StartWhatsAppSession(whatsapp), 2000);
      } catch (err) {
        logger.error(err);
      }

      io.emit(`${whatsapp.tenantId}:whatsappSession`, {
        action: "update",
        session: whatsapp
      });
    });
  } catch (err) {
    logger.error(err);
  }
};

export default wbotMonitor;
