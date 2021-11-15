import { Telegraf } from "telegraf";
import { getIO } from "./socket";

import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";

interface Session extends Telegraf {
  id?: number;
}

const sessions: Session[] = [];

export const initTbot = async (connection: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = connection.name;
      const { tenantId } = connection;
      const tbot: Session = new Telegraf(connection.tokenTelegram, {});
      const sessionIndex = sessions.findIndex(s => s.id === connection.id);
      if (sessionIndex === -1) {
        tbot.id = connection.id;
        sessions.push(tbot);
      } else {
        tbot.id = connection.id;
        sessions[sessionIndex] = tbot;
      }
      tbot.launch();
      connection.update({
        status: "CONNECTED",
        qrcode: "",
        retries: 0
      });

      io.emit(`${tenantId}-whatsappSession`, {
        action: "update",
        session: connection
      });

      logger.info(`Session TELEGRAM: ${sessionName} - READY `);
      // Enable graceful stop
      process.once("SIGINT", () => tbot.stop("SIGINT"));
      process.once("SIGTERM", () => tbot.stop("SIGTERM"));
      resolve(tbot);
    } catch (error) {
      logger.error(`initWbot error | Error: ${error}`);
      reject(new Error("Error starting telegram session."));
    }
  });
};

export const getTbot = (whatsappId: number, checkState = true): Session => {
  logger.info(`whatsappId: ${whatsappId} | checkState: ${checkState}`);
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  return sessions[sessionIndex];
};

export const removeTbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      // Enable graceful stop
      process.once("SIGINT", () => sessions[sessionIndex].stop("SIGINT"));
      process.once("SIGTERM", () => sessions[sessionIndex].stop("SIGTERM"));
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeTbot | Error: ${err}`);
  }
};
