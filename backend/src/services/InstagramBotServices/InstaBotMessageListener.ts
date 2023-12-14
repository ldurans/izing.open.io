/* eslint-disable camelcase */
import {
  AccountRepositoryCurrentUserResponseUser,
  AccountRepositoryLoginResponseLogged_in_user
} from "instagram-private-api";
import { IgApiClientMQTT } from "instagram_mqtt";
import handleRealtimeReceive from "./handleRealtimeReceive";
// import HandleMessageTelegram from "./HandleMessageTelegram";

interface Session extends IgApiClientMQTT {
  id: number;
  accountLogin?:
    | AccountRepositoryLoginResponseLogged_in_user
    | AccountRepositoryCurrentUserResponseUser;
}
const InstaBotMessageListener = (instaBot: Session): void => {
  instaBot.realtime.on("message", async ctx => {
    // não processar as mudanças de status
    if (ctx.message.op === "replace" && ctx.message_type === 1) return;

    // evitar envio duplicado, não processar os envios feito pelo sistema
    if (instaBot?.accountLogin?.pk === ctx.message.user_id) return;
    handleRealtimeReceive(ctx, instaBot);
  });

  instaBot.realtime.on("direct", ev => {
    console.log("direct ev", ev);
  });

  instaBot.realtime.on("realtimeSub", ev => {
    console.log("realtimeSub ev", ev);
  });

  instaBot.realtime.on("iris", ev => {
    console.log("iris ev", ev);
  });

  instaBot.realtime.on("error", console.error);
  instaBot.realtime.on("close", () => console.error("RealtimeClient closed"));

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  instaBot.fbns.on("push", (data: any) => {
    // this.handleFbnsReceive(data)
  });
};

export { InstaBotMessageListener };
