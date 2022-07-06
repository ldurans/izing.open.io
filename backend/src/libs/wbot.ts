import { Client, LocalAuth, DefaultOptions } from "whatsapp-web.js";
// import { rmdir } from "fs/promises";
// import path from "path";
// import slugify from "slugify";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import { getValue, setValue } from "./redisClient";
import { logger } from "../utils/logger";
import SyncUnreadMessagesWbot from "../services/WbotServices/SyncUnreadMessagesWbot";
import Queue from "./Queue";

interface Session extends Client {
  id: number;
}

const sessions: Session[] = [];

// const checking: any = {};

const checkMessages = async (wbot: Session, tenantId: number | string) => {
  // if (checking[tenantId]) return;
  // checking[tenantId] = true;
  try {
    const isConnectStatus = await getValue(`wbotStatus-${tenantId}`);
    logger.info("wbot:checkMessages:status", wbot, tenantId, isConnectStatus);

    if (isConnectStatus === "CONNECTED") {
      logger.info("wbot:connected:checkMessages", wbot, tenantId);
      // logger.info(`checking new message tenant ${tenantId}`);
      // await SendMessagesSystemWbot(wbot, tenantId);
      Queue.add("SendMessages", { sessionId: wbot.id, tenantId });
    }
  } catch (error) {
    logger.error(`ERROR: checkMessages Tenant: ${tenantId}::`, error);
  }
};

// const apagarPastaSessao = async (whatsapp: Whatsapp): Promise<void> => {
//   const pathRoot = path.resolve(__dirname, "..", "..", "WWebJS");
//   const pathSession = `${pathRoot}/session-${whatsapp.name}`;
//   await rmdir(pathSession, { recursive: true });
// };

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
        // session: sessionCfg,
        authStrategy: new LocalAuth({ clientId: `wbot_${whatsapp.id}` }),
        puppeteer: {
          // headless: false,
          executablePath: process.env.CHROME_BIN || undefined,
          args: [`--user-agent=${DefaultOptions.userAgent}`]
          //     // args: [`--user-agent=${DefaultOptions.userAgent}`]
        }
      }) as Session;

      // const wbot = new Client({
      //   session: sessionCfg,
      //   puppeteer: {
      //     // headless: false,
      //     // executablePath: process.env.CHROME_BIN || undefined // "/usr/bin/google-chrome",
      //   }
      // }) as Session;

      wbot.id = whatsapp.id;

      wbot.initialize();

      wbot.on("qr", async qr => {
        logger.info(
          `Session QR CODE: ${sessionName}-ID: ${whatsapp.id}-${whatsapp.status}`
        );
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
        await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        } else {
          wbot.id = whatsapp.id;
          sessions[sessionIndex] = wbot;
        }
        await setValue(`${wbot.id}`, whatsapp);

        // if (retryQrCode > 5) {
        //   await wbot.destroy();
        //   await setValue(`${ whatsapp.id }-retryQrCode`, 0);
        //   await whatsapp.update({ status: "DESTROYED", retries: 0 });
        //   await apagarPastaSessao(whatsapp);
        //   await setValue(`wbotStatus-${ tenantId }`, whatsapp.status);
        // }

        io.emit(`${tenantId}:whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        logger.info(`Session: ${sessionName} AUTHENTICATED`);
        await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
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
        // await apagarPastaSessao(whatsapp);
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

        await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
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

        await setValue(`wbotStatus-${tenantId}`, whatsapp.status);

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
        setValue(`${wbot.id}`, whatsapp);
        wbot.sendPresenceAvailable();
        SyncUnreadMessagesWbot(wbot, tenantId);
        // SendOffLineMessagesWbot(wbot, tenantId);
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
            await setValue(`${whatsapp.id}-retryQrCode`, 0);
            await whatsapp.update({
              status: "DESTROYED",
              retries: 0,
              session: ""
            });
            await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
            // await apagarPastaSessao(whatsapp);
            await wbot.logout();
            await wbot.destroy();
          } else if (reason === "CONFLICT") {
            await whatsapp.update({ status: "DISCONNECTED", retries: 0 });
            await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
          } else {
            await whatsapp.update({
              status: "DESTROYED",
              retries: 0,
              session: ""
            });
            await setValue(`wbotStatus-${tenantId}`, whatsapp.status);
            // await apagarPastaSessao(whatsapp);
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
      setValue(`sendingMessages_tenant_${whatsapp.tenantId}`, false);
      setInterval(
        checkMessages,
        +(process.env.CHECK_INTERVAL || 5000),
        wbot,
        tenantId
      );
    } catch (err) {
      logger.error(`initWbot error | Error: ${err}`);
      // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.'
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  // logger.info(`whatsappId: ${ whatsappId } | checkState: ${ checkState }`);
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  // if (sessionIndex === -1) {
  //   StartWhatsAppSessionVerify(whatsappId, "ERR_WAPP_NOT_INITIALIZED")
  //     .then(() => {
  //       throw new AppError("ERR_WAPP_INITIALIZED");
  //     })
  //     .catch(() => {
  //       throw new Error("ERR_WAPP_NOT_INITIALIZED");
  //     });
  // }

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
