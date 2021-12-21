import { Telegraf } from "telegraf";
import { getIO } from "../../libs/socket";
import { initTbot } from "../../libs/tbot";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { tbotMessageListener } from "./tbotMessageListener";
import TelegramSendMessagesSystem from "./TelegramSendMessagesSystem";

interface Session extends Telegraf {
  id: number;
}

const checkingTelegram: any = {};

const checkMessages = async (tbot: Session, tenantId: number | string) => {
  if (checkingTelegram[tenantId]) return;
  checkingTelegram[tenantId] = true;
  try {
    await TelegramSendMessagesSystem(tbot, tenantId);
    // Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
  } catch (error) {
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
  checkingTelegram[tenantId] = false;
};

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
    setInterval(
      checkMessages,
      +(process.env.CHECK_INTERVAL || 5000),
      tbot,
      connection.tenantId
    );
  } catch (err) {
    logger.error(`StartTbotSession | Error: ${err}`);
  }
};
