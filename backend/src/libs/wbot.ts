import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
import path from "path";
import { rmdir } from "fs/promises";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import Queue from "./Queue";

interface Session extends Client {
  id: number;
}

const sessions: Session[] = [];

const checking: any = {};

export const apagarPastaSessao = async (id: number | string): Promise<void> => {
  const pathRoot = path.resolve(__dirname, "..", "..", ".wwebjs_auth");
  const pathSession = `${pathRoot}/session-wbot_${id}`;
  const rm = await rmdir(pathSession, { recursive: true });
  console.log(`apagarPastaSessao:: ${pathSession}`, rm);
};

const checkMessages = async (wbot: Session, tenantId: number | string) => {
  try {
    const isConnectStatus = wbot && (await wbot.getState()) === "CONNECTED"; // getValue(`wbotStatus-${tenantId}`);
    logger.info(
      "wbot:checkMessages:status",
      wbot.id,
      tenantId,
      isConnectStatus
    );

    if (isConnectStatus) {
      logger.info("wbot:connected:checkMessages", wbot, tenantId);
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
    }
  } catch (error) {
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      const { tenantId } = whatsapp;
      let sessionCfg;
      if (whatsapp?.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }

      const wbot = new Client({
        authStrategy: new LocalAuth({ clientId: `wbot_${whatsapp.id}` }),
        puppeteer: {
          // headless: false,
          executablePath: process.env.CHROME_BIN || undefined,
          args: [`--user-agent=${DefaultOptions.userAgent}`]
        }
      }) as Session;

      wbot.id = whatsapp.id;

      wbot.initialize();

      wbot.on("qr", async qr => {
        logger.info(
          `Session QR CODE: ${sessionName}-ID: ${whatsapp.id}-${whatsapp.status}`
        );
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        } else {
          wbot.id = whatsapp.id;
          sessions[sessionIndex] = wbot;
        }

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
        if (session) {
          await whatsapp.update({
            session: JSON.stringify(session)
          });
        }
      });

      wbot.on("auth_failure", async msg => {
        logger.error(
          `Session: ${sessionName}-AUTHENTICATION FAILURE :: ${msg}`
        );
        if (whatsapp.retries > 1) {
          await whatsapp.update({
            status: "DESTROYED",
            retries: 0,
            session: ""
          });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        logger.info(`Session: ${sessionName}-READY`);

        // if (process.env.NODE_ENV === "prod") {
        //   logger.info("Iniciando sincronização de contatos.");
        //   syncContacts(wbot, tenantId);
        // }
        const info: any = wbot?.info;
        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot?.info?.wid?.user, // || wbot?.info?.me?.user,
          phone: info?.phone || {}
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });

        io.emit(`${tenantId}:whatsappSession`, {
          action: "readySession",
          session: whatsapp
        });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        } else {
          wbot.id = whatsapp.id;
          sessions[sessionIndex] = wbot;
        }
        wbot.sendPresenceAvailable();
        SyncUnreadMessagesWbot(wbot, tenantId);
        resolve(wbot);
      });

      wbot.on("disconnected", async reason => {
        logger.info(`disconnected wbot ${reason}`);

        try {
          if (reason === "UNPAIRED") {
            logger.info(
              `Disconnected(UNPAIRED) session DEstroy: ${sessionName} | ${reason}`
            );
            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
            if (sessionIndex === -1) {
              wbot.id = whatsapp.id;
              sessions.push(wbot);
            } else {
              wbot.id = whatsapp.id;
              sessions[sessionIndex] = wbot;
            }
            await whatsapp.update({
              status: "DESTROYED",
              retries: 0,
              session: ""
            });
            await apagarPastaSessao(whatsapp.id);
            await wbot.logout();
            await wbot.destroy();
          } else if (reason === "CONFLICT") {
            await whatsapp.update({ status: "DISCONNECTED", retries: 0 });
          } else {
            await whatsapp.update({
              status: "DESTROYED",
              retries: 0,
              session: ""
            });
            await apagarPastaSessao(whatsapp.id);
            await wbot.logout();
            await wbot.destroy();
          }
        } catch (err) {
          logger.error(`wbot: update: disconnected.Error: ${err}`);
        }

        io.emit(`${whatsapp.tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });
      setInterval(
        checkMessages,
        +(process.env.CHECK_INTERVAL || 5000),
        wbot,
        tenantId
      );
      // WhatsappConsumer(tenantId);
    } catch (err) {
      logger.error(`initWbot error | Error: ${err}`);
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
  return sessions[sessionIndex];
};

export const removeWbot = (whatsappId: number): void => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);
    if (sessionIndex !== -1) {
      sessions[sessionIndex].destroy();
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(`removeWbot | Error: ${err}`);
  }
};
