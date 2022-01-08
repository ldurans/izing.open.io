/* eslint-disable camelcase */
import AppError from "../../errors/AppError";
import { initMessengerBot } from "../../libs/messengerBot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";

const checkingMessenger: any = {};

const messengerCheckMessages = async (connection: Whatsapp) => {
  if (checkingMessenger[connection.tenantId]) return;
  checkingMessenger[connection.tenantId] = true;
  try {
    // await Waba360SendMessagesSystem(connection);
  } catch (error) {
    logger.error(
      `ERROR Messenger: checkMessages Tenant: ${connection.tenantId}::`,
      error
    );
  }
  checkingMessenger[connection.tenantId] = false;
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
    await initMessengerBot(connection);
    await connection.update({ status: "CONNECTED", number: phoneNumber });
    setInterval(
      messengerCheckMessages,
      +(process.env.CHECK_INTERVAL || 5000),
      connection
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
