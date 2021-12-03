import { IgApiClientMQTT } from "instagram_mqtt";
import HandleMessage from "./HandleMessageInstagram";
import handleRealtimeReceive from "./handleRealtimeReceive";
// import HandleMessageTelegram from "./HandleMessageTelegram";

interface Session extends IgApiClientMQTT {
  id?: number;
}

const InstaBotMessageListener = (instaBot: Session): void => {
  // instaBot.on("message", async ctx => {
  //   HandleMessageTelegram(ctx, instaBot);
  // });
  // instaBot.realtime.on("receive", (topic: any, messages: any) => {
  //   // this.handleRealtimeReceive(topic, messages)
  //   console.log("receive", topic, messages);
  //   handleRealtimeReceive(topic, messages);
  //   // HandleMessage(messages, instaBot);
  // });

  instaBot.realtime.on("message", async ctx => {
    // this.handleRealtimeReceive(topic, messages)
    console.log("message", ctx);
    // op = replace,
    // message_type = 1
    // HandleMessage(messages, instaBot);
    handleRealtimeReceive(ctx, instaBot);
  });

  instaBot.realtime.on("error", console.error);
  instaBot.realtime.on("close", () => console.error("RealtimeClient closed"));

  instaBot.fbns.on("push", (data: any) => {
    // this.handleFbnsReceive(data)
    console.log("handleFbnsReceive", data);
  });
  // tbot.launch();
};

export { InstaBotMessageListener };
