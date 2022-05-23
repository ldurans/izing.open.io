/* eslint-disable camelcase */
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
// import GetRegisteredPhone from "./GetRegisteredPhone";
import SetWebHookUrl from "./SetWebHookUrl";
import Waba360SendMessagesSystem from "./Waba360SendMessagesSystem";

const checkingWaba360: any = {};

const checkMessagesWaba360 = async (connection: Whatsapp) => {
  if (checkingWaba360[connection.tenantId]) return;
  checkingWaba360[connection.tenantId] = true;
  try {
    await Waba360SendMessagesSystem(connection);
  } catch (error) {
    logger.error(
      `ERROR: checkMessages Tenant: ${connection.tenantId}::`,
      error
    );
  }
  checkingWaba360[connection.tenantId] = false;
};

export const StartWaba360 = async (connection: Whatsapp): Promise<void> => {
  const io = getIO();
  await connection.update({ status: "OPENING" });
  io.emit(`${connection.tenantId}:whatsappSession`, {
    action: "update",
    session: connection
  });

  try {
    await SetWebHookUrl({
      // eslint-disable-next-line no-bitwise
      url: connection.UrlWabaWebHook || "",
      apiKey: connection.tokenAPI
    });
    const phoneNumber = ""; // await GetRegisteredPhone(connection.tokenAPI);
    logger.info(`Conexão Waba 360 iniciada | Empresa: ${connection.tenantId}`);
    await connection.update({ status: "CONNECTED", number: phoneNumber });
    setInterval(
      checkMessagesWaba360,
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
