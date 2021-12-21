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
import InstagramSendMessagesSystem from "./InstagramSendMessagesSystem";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
  | AccountRepositoryLoginResponseLogged_in_user
  | AccountRepositoryCurrentUserResponseUser;
}

const checkingInstagram: any = {};

const checkMessages = async (instaBot: Session, tenantId: number | string) => {
  if (checkingInstagram[tenantId]) return;
  checkingInstagram[tenantId] = true;
  try {
    await InstagramSendMessagesSystem(instaBot, tenantId);
  } catch (error) {
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
  checkingInstagram[tenantId] = false;
};

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
    setInterval(
      checkMessages,
      +(process.env.CHECK_INTERVAL || 5000),
      instaBot,
      connection.tenantId
    );
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
