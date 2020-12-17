import qrCode from "qrcode-terminal";
import { Client } from "whatsapp-web.js";
import { getIO } from "./socket";
import Whatsapp from "../models/Whatsapp";
import AppError from "../errors/AppError";
import Contact from "../models/Contact";
// import { handleMessage } from "../services/WbotServices/wbotMessageListener";

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

const syncContacts = async (wbot: Session) => {
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
        const contactObj = { name: name || pushname, number };
        dataArray.push(contactObj);
      }
    })
  );
  if (dataArray.length) {
    return Contact.bulkCreate(dataArray, {
      fields: ["number", "name"],
      updateOnDuplicate: ["number"]
    });
  }
  return null;
};

export const initWbot = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise((resolve, reject) => {
    try {
      const io = getIO();
      const sessionName = whatsapp.name;
      let sessionCfg;

      if (whatsapp && whatsapp.session) {
        sessionCfg = JSON.parse(whatsapp.session);
      }
      console.log("process.env.CHROME_BIN", process.env.CHROME_BIN);
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
        console.log("Session:", sessionName);
        qrCode.generate(qr, { small: true });
        await whatsapp.update({ qrcode: qr, status: "qrcode", retries: 0 });

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        io.emit("whatsappSession", {
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

        if (whatsapp.retries > 1) {
          await whatsapp.update({ session: "", retries: 0 });
        }

        const retry = whatsapp.retries;
        await whatsapp.update({
          status: "DISCONNECTED",
          retries: retry + 1
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        reject(new Error("Error starting whatsapp session."));
      });

      wbot.on("ready", async () => {
        console.log("Session:", sessionName, "READY");

        // syncUnreadMessages(wbot);
        if (process.env.NODE_ENV === "prod") {
          console.log("Lista de contatos sincronizada - syncContacts");
          syncContacts(wbot);
        }

        await whatsapp.update({
          status: "CONNECTED",
          qrcode: "",
          retries: 0
        });

        io.emit("whatsappSession", {
          action: "update",
          session: whatsapp
        });

        wbot.sendPresenceAvailable();

        const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
        if (sessionIndex === -1) {
          wbot.id = whatsapp.id;
          sessions.push(wbot);
        }

        resolve(wbot);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

export const getWbot = (whatsappId: number): Session => {
  console.log("whatsappId", whatsappId);
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
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
    console.log(err);
  }
};
