/* eslint-disable eqeqeq */
import { MessengerClient } from "messaging-api-messenger";
import process from "process";
import AppError from "../errors/AppError";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

interface Session extends MessengerClient {
  id: number;
}

const sessionsMessenger: Session[] = [];

export const initMessengerBot = async (
  connection: Whatsapp
): Promise<Session> => {
  try {
    // const io = getIO();

    const accessToken = connection.tokenAPI;
    const appId = process.env.VUE_FACEBOOK_APP_ID;
    // const appSecret = "3266b8c98ac59f3e957a5efeaaa13500";
    // const password = "";
    if (!accessToken) {
      throw new Error("Not token configured");
    }

    // if (connection && connection.session) {
    //   sessionCfg = JSON.parse(connection.session);
    // }

    const messengerClient = new MessengerClient({
      accessToken,
      appId
      // appSecret
      // version: '6.0',
    }) as Session;

    messengerClient.id = connection.id;

    const sessionIndex = sessionsMessenger.findIndex(
      s => s.id === connection.id
    );
    if (sessionIndex === -1) {
      messengerClient.id = connection.id;
      sessionsMessenger.push(messengerClient);
    } else {
      messengerClient.id = connection.id;
      sessionsMessenger[sessionIndex] = messengerClient;
    }

    return messengerClient;
  } catch (err) {
    logger.error(`initMessengerBot error | Error: ${err}`);
    throw new AppError(`${err}`, 404);
    // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.'
  }
};

export const getMessengerBot = (channelId: number | string): Session => {
  // logger.info(`channelId: ${ channelId } | checkState: ${ checkState }`);
  const sessionIndex = sessionsMessenger.findIndex(s => s.id == channelId);

  return sessionsMessenger[sessionIndex];
};
