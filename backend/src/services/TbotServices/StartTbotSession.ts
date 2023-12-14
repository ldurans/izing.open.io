import { getIO } from "../../libs/socket";
import { initTbot } from "../../libs/tbot";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { tbotMessageListener } from "./tbotMessageListener";

export const StartTbotSession = async (connection: Whatsapp): Promise<void> => {
  const io = getIO();
  await connection.update({ status: "OPENING" });
  io.emit(`${connection.tenantId}:whatsappSession`, {
    action: "update",
    session: connection
  });

  try {
    const tbot = await initTbot(connection);
    tbotMessageListener(tbot);
  } catch (err) {
    logger.error(`StartTbotSession | Error: ${err}`);
  }
};
