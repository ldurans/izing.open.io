/* eslint-disable camelcase */
import AppError from "../../errors/AppError";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import GetRegisteredPhone from "./GetRegisteredPhone";
import SetWebHookUrl from "./SetWebHookUrl";

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
      apiKey: connection.wabaApiKey
    });
    const phoneNumber = await GetRegisteredPhone(connection.wabaApiKey);
    logger.info(`Conexão Waba 360 iniciada | Empresa: ${connection.tenantId}`);
    await connection.update({ status: "CONNECTED", number: phoneNumber });
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
