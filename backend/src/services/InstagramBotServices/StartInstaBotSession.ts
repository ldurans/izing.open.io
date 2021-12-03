import { IgApiClientMQTT } from "instagram_mqtt";
import { initInstaBot } from "../../libs/InstaBot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { InstaBotMessageListener } from "./InstaBotMessageListener";

interface Session extends IgApiClientMQTT {
  id?: number;
}
const checkMessages = async (tbot: Session, tenantId: number | string) => {
  // if (checking[tenantId]) return;
  // checking[tenantId] = true;
  try {
    // await TelegramSendMessagesSystem(tbot, tenantId);
  } catch (error) {
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
  // checking[tenantId] = false;
};

export const StartInstaBotSession = async (
  connection: Whatsapp
): Promise<void> => {
  await connection.update({ status: "OPENING" });
  const io = getIO();
  io.emit(`${connection.tenantId}-whatsappSession`, {
    action: "update",
    session: connection
  });

  try {
    const instaBot = await initInstaBot(connection);
    InstaBotMessageListener(instaBot);
    setInterval(
      checkMessages,
      +(process.env.CHECK_INTERVAL || 5000),
      instaBot,
      connection.tenantId
    );
  } catch (err) {
    logger.error(`StartInstaBotSession | Error: ${err}`);
  }
};
