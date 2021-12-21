import { Telegraf } from "telegraf";
import { getIO } from "./socket";

import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

interface Session extends Telegraf {
  id: number;
}

const TelegramSessions: Session[] = [];

export const initTbot = async (connection: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = connection.name;
      const { tenantId } = connection;
      const tbot = new Telegraf(connection.tokenTelegram, {}) as Session;
      tbot.id = connection.id;
      const sessionIndex = TelegramSessions.findIndex(
        s => s.id === connection.id
      );
      if (sessionIndex === -1) {
        tbot.id = connection.id;
        TelegramSessions.push(tbot);
      } else {
        tbot.id = connection.id;
        TelegramSessions[sessionIndex] = tbot;
      }
      tbot.launch();
      connection.update({
        status: "CONNECTED",
        qrcode: "",
        retries: 0
      });

      io.emit(`${tenantId}:whatsappSession`, {
        action: "update",
        session: connection
      });

      logger.info(`Session TELEGRAM: ${sessionName} - READY `);
      // Enable graceful stop
      process.once("SIGINT", () => tbot.stop("SIGINT"));
      process.once("SIGTERM", () => tbot.stop("SIGTERM"));
      resolve(tbot);
    } catch (error) {
      connection.update({
        status: "DISCONNECTED",
        qrcode: "",
        retries: 0
      });
      logger.error(`initWbot error | Error: ${error}`);
      reject(new Error("Error starting telegram session."));
    }
  });
};

export const getTbot = (whatsappId: number, checkState = true): Session => {
  logger.info(`whatsappId: ${whatsappId} | checkState: ${checkState}`);
  const sessionIndex = TelegramSessions.findIndex(s => s.id === whatsappId);

  return TelegramSessions[sessionIndex];
};

export const removeTbot = (whatsappId: number): void => {
  try {
    const sessionIndex = TelegramSessions.findIndex(s => s.id === whatsappId);
    const sessionSet: any = TelegramSessions[sessionIndex];
    if (sessionIndex !== -1) {
      // Enable graceful stop
      process.once("SIGINT", () => sessionSet.stop("SIGINT"));
      process.once("SIGTERM", () => sessionSet.stop("SIGTERM"));
      TelegramSessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeTbot | Error: ${err}`);
  }
};
