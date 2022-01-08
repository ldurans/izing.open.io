/* eslint-disable eqeqeq */
import { MessengerClient } from "messaging-api-messenger";
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

    const accessToken =
      "EAAuAaZAAzvdQBAK4oFjybPwiWPlX0mdRMm3HVobVWfVx93LYa7DJ0ICNdrkFVxCdgWWc1d8SmTl4YkzY50SBNmhbP8FpQnw3RKcgltWjqmgzO89MhBU6qrQQTuZCk2lwS785AApwvkpV6yCexhgUenCYcSJvD8jbrR9VescAtsO3lXIN6K";
    const appId = "3237415623048660";
    const appSecret = "3266b8c98ac59f3e957a5efeaaa13500";
    // const password = "";
    if (!accessToken) {
      throw new Error("Not token configured");
    }

    // if (connection && connection.session) {
    //   sessionCfg = JSON.parse(connection.session);
    // }

    const messengerClient = new MessengerClient({
      accessToken,
      appId,
      appSecret
      // version: '6.0',
    }) as Session;

    console.log("Cliente Messenger: ", messengerClient);
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
