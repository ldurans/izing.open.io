import { Client } from "whatsapp-web.js";

import HandleMessage from "./helpers/HandleMessage";
import HandleMsgAck from "./helpers/HandleMsgAck";
import VerifyCall from "./VerifyCall";

interface Session extends Client {
  id: number;
}

const wbotMessageListener = (wbot: Session): void => {
  // const queue = `whatsapp::${wbot.id}`;
  wbot.on("message_create", async msg => {
    // desconsiderar atualização de status
    if (msg.isStatus) {
      return;
    }
    HandleMessage(msg, wbot);
  });

  wbot.on("media_uploaded", async msg => {
    HandleMessage(msg, wbot);
  });

  wbot.on("message_ack", async (msg, ack) => {
    HandleMsgAck(msg, ack);
  });

  wbot.on("call", async call => {
    VerifyCall(call, wbot);
  });
};

export { wbotMessageListener, HandleMessage };
