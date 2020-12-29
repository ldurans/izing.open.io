// import qrCode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
import Tenant from "../models/Tenant";
import { StartWhatsAppSessionVerify } from "../services/WbotServices/StartWhatsAppSessionVerify";
// import { handleMessage } from "../services/WbotServices/wbotMessageListener";
import { getValue, setValue } from "./redisClient";

interface Session extends Client {
  id?: number;
}

const sessions: Session[] = [];

// const syncUnreadMessages = async (wbot: Session) => {
//   const chats = await wbot.getChats();

//   chats.forEach(async chat => {
//     if (chat.unreadCount > 0) {
//       const unreadMessages = await chat.fetchMessages({
//         limit: chat.unreadCount
//       });
//       unreadMessages.forEach(msg => {
//         handleMessage(msg, wbot);
//       });
//     }
//   });
// };

const syncContacts = async (wbot: Session, tenantId: string | number) => {
  let contacts;
  try {
    contacts = await wbot.getContacts();
  } catch (err) {
    console.log(
      "Could not get whatsapp contacts from phone. Check connection page.",
      err
    );
  }

  if (!contacts) {
    return null;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  const dataArray: object[] = [];
  await Promise.all(
    contacts.map(async ({ name, pushname, number, isGroup }) => {
      if ((name || pushname) && !isGroup) {
        // const profilePicUrl = await wbot.getProfilePicUrl(`${number}@c.us`);
        const contactObj = { name: name || pushname, number, tenantId };
        dataArray.push(contactObj);
      }
    })
  );
  if (dataArray.length) {
    await Contact.bulkCreate(dataArray, {
      fields: ["number", "name", "tenantId"],
      updateOnDuplicate: ["name", "number"],
      include: [
        {
          model: Tenant,
          as: "tenant",
          where: { tenantId }
        }
      ]
    });
    console.log("Lista de contatos sincronizada - syncContacts");
  }
  return true;
};

// const getConnectionStateIsValid = async (
//   wbot: Session,
//   whatsappId: number
// ): Promise<void> => {
//   const io = getIO();
//   try {
//     const state = await wbot.getState();
//     console.log("getConnectionStateIsValid", state);
//   } catch (error) {
//     const whatsapp = await Whatsapp.findByPk(whatsappId);
//     if (whatsapp) {
//       await whatsapp.update({ status: "OPENING", retries: 0 });
//       io.emit(`${whatsapp.tenantId}-whatsappSession`, {
//         action: "update",
//         session: whatsapp
//       });
//     }
//     await wbot.initialize();
//   }
// };

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      const { tenantId } = whatsapp;
      let sessionCfg;
      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }
      const wbot: Session = new Client({
        session: sessionCfg,
        puppeteer: {
          headless: true,
          executablePath: process.env.CHROME_BIN || null, // "/usr/bin/google-chrome",
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-accelerated-2d-canvas",
            "--no-first-run",
            "--no-zygote",
            "--process-per-site",
            "--disable-gpu"
          ]
        }
      });

      wbot.initialize();

      wbot.on("qr", async qr => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let retryQrCode: any = await getValue(`${whatsapp.id}-retryQrCode`);
        if (!retryQrCode) {
          await setValue(`${whatsapp.id}-retryQrCode`, 1);
          retryQrCode = 1;
        }
        console.log(
          "Session QR CODE:",
          sessionName,
          whatsapp.id,
          whatsapp.status
        );
        await setValue(`${whatsapp.id}-retryQrCode`, retryQrCode + 1);
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });
        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        } else {
          wbot.id = whatsapp.id;
          sessions[sessionIndex] = wbot;
        }
        await setValue(`${wbot.id}`, whatsapp);

        if (retryQrCode > 5) {
          await wbot.destroy();
          await setValue(`${whatsapp.id}-retryQrCode`, 0);
          await whatsapp.update({ status: "DESTROYED", retries: 0 });
        }

        io.emit(`${tenantId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });

      wbot.on("authenticated", async session => {
        console.log("Session:", sessionName, "AUTHENTICATED");
        await whatsapp.update({
          session: JSON.stringify(session)
        });
      });

      wbot.on("auth_failure", async msg => {
        console.error("Session:", sessionName, "AUTHENTICATION FAILURE", msg);

        // if (whatsapp.retries > 3) {
        //   await whatsapp.update({ session: "", retries: 0 });
        //   // removeValue(`${wbot.id}`);
        // }
        const retry = whatsapp.retries;
        if (retry > 2) {
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
        } else {
          await whatsapp.update({
            status: "DISCONNECTED",
            retries: retry + 1
          });
        }

        io.emit(`${tenantId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });

        // try {
        //   await wbot.initialize();
        //   // resolve(wbot);
        // } catch (error) {
        //   reject(new Error("Error starting whatsapp session."));
        // }
        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        console.log("Session:", sessionName, "READY");

        // syncUnreadMessages(wbot);
        if (process.env.NODE_ENV === "prod") {
          console.log("Iniciando sincronização de contatos.");
          syncContacts(wbot, tenantId);
        }

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0,
          number: wbot.info.me.user,
          phone: wbot.info.phone
        });

        io.emit(`${tenantId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });

        io.emit(`${tenantId}-whatsappSession`, {
          action: "readySession",
          session: whatsapp
        });

        wbot.sendPresenceAvailable();

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        } else {
          wbot.id = whatsapp.id;
          sessions[sessionIndex] = wbot;
        }
        setValue(`${wbot.id}`, whatsapp);
        resolve(wbot);
      });

      wbot.on("TIMEOUT", async reason => {
        console.log(
          "TIMEOUT - Cliente",
          sessionName,
          whatsapp.id,
          whatsapp.status,
          reason
        );
      });

      wbot.on("disconnected", async reason => {
        console.log("disconnected wbot", reason);

        try {
          if (reason === "UNPAIRED") {
            console.log(
              "Disconnected (UNPAIRED) session DEstroy:",
              sessionName,
              reason
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
            await wbot.logout();
            await wbot.destroy();
          } else if (reason === "CONFLICT") {
            await whatsapp.update({ status: "DISCONNECTED", retries: 0 });
          } else {
            await whatsapp.update({ status: "qrcode", retries: 0 });
          }
        } catch (err) {
          console.log("wbot:update:disconnected", err);
        }

        io.emit(`${whatsapp.tenantId}-whatsappSession`, {
          action: "update",
          session: whatsapp
        });
      });
    } catch (err) {
      console.log("initWbot", err);
      // 'Error: Protocol error (Runtime.callFunctionOn): Session closed.'
    }
  });
};

export const getWbot = (whatsappId: number, checkState = true): Session => {
  console.log("whatsappId", whatsappId, "checkState", checkState);
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    StartWhatsAppSessionVerify(whatsappId, "ERR_WAPP_NOT_INITIALIZED")
      .then(() => {
        throw new AppError("ERR_WAPP_INITIALIZED");
      })
      .catch(() => {
        throw new Error("ERR_WAPP_NOT_INITIALIZED");
      });
  }

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
    console.log("removeWbot", err);
  }
};
