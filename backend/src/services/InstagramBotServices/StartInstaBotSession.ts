/* eslint-disable camelcase */
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user
} from "instagram-private-api";
import { IgApiClientMQTT } from "instagram_mqtt";
import AppError from "../../errors/AppError";
import { initInstaBot } from "../../libs/InstaBot";
import { getIO } from "../../libs/socket";
import Whatsapp from "../../models/Whatsapp";
import { logger } from "../../utils/logger";
import { InstaBotMessageListener } from "./InstaBotMessageListener";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
    | AccountRepositoryLoginResponseLogged_in_user
    | AccountRepositoryCurrentUserResponseUser;
}

export const StartInstaBotSession = async (
  connection: Whatsapp
): Promise<void> => {
  const io = getIO();
  await connection.update({ status: "OPENING" });
  io.emit(`${connection.tenantId}:whatsappSession`, {
    action: "update",
    session: connection
  });

  try {
    const instaBot = await initInstaBot(connection);
    InstaBotMessageListener(instaBot);
    logger.info(`Conexão Instagram iniciada | Empresa: ${connection.tenantId}`);
    await connection.update({ status: "CONNECTED" });
    io.emit(`${connection.tenantId}:whatsappSession`, {
      action: "update",
      session: connection
    });
  } catch (err) {
    logger.error(`StartInstaBotSession | Error: ${err}`);
    await connection.update({ status: "DISCONNECTED" });
    io.emit(`${connection.tenantId}:whatsappSession`, {
      action: "update",
      session: connection
    });
    throw new AppError(`ERROR_CONNECT_INSTAGRAM: ${err}`, 404);
  }
};
