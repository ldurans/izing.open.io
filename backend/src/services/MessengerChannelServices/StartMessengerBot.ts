/* eslint-disable camelcase */
import { MessengerClient } from "messaging-api-messenger";
import AppError from "../../errors/AppError";
import { initMessengerBot } from "../../libs/messengerBot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import MessengerSendMessagesSystem from "./MessengerSendMessagesSystem";

interface Session extends MessengerClient {
  id: number;
}

const checkingMessenger: any = {};

const messengerCheckMessages = async (
  messengerBot: Session,
  tenantId: string | number
) => {
  if (checkingMessenger[tenantId]) return;
  checkingMessenger[tenantId] = true;
  try {
    // await Waba360SendMessagesSystem(connection);
    await MessengerSendMessagesSystem(messengerBot, tenantId);
  } catch (error) {
    logger.error(`ERROR Messenger: checkMessages Tenant: ${tenantId}::`, error);
  }
  checkingMessenger[tenantId] = false;
};

export const StartMessengerBot = async (
  connection: Whatsapp
): Promise<void> => {
  const io = getIO();
  await connection.update({ status: "OPENING" });
  io.emit(`${connection.tenantId}:whatsappSession`, {
    action: "update",
    session: connection
  });

  try {
    const phoneNumber = ""; // await GetRegisteredPhone(connection.tokenAPI);
    logger.info(`Conexão Messenger iniciada | Empresa: ${connection.tenantId}`);
    const messengerBot = await initMessengerBot(connection);
    await connection.update({ status: "CONNECTED", number: phoneNumber });
    setInterval(
      messengerCheckMessages,
      +(process.env.CHECK_INTERVAL || 5000),
      messengerBot,
      connection.tenantId
    );
    io.emit(`${connection.tenantId}:whatsappSession`, {
      action: "update",
      session: connection
    });
  } catch (err) {
    logger.error(`SetWebHookUrl 360 | Error: ${err}`);
    await connection.update({ status: "DISCONNECTED" });
    io.emit(`${connection.tenantId}:whatsappSession`, {
      action: "update",
      session: connection
    });
    throw new AppError(`ERROR_CONNECT_WABA_360: ${err}`, 404);
  }
};
