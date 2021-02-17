import { Telegraf } from "telegraf";

interface Session extends Telegraf {
  id?: number;
}

const tbotMessageListener = (tbot: Session): void => {
  tbot.on("message", async ctx => {
    console.log("message telegram", ctx);
  });
  tbot.launch();
};

export { tbotMessageListener };
