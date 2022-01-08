import { verify } from "jsonwebtoken";
import RabbitmqServer from "../../libs/rabbitmq-server";
import authConfig from "../../config/auth";
import MessengerHandleMessage from "./MessengerHandleMessage";

const MessengerConsumer = async () => {
  const rabbit = new RabbitmqServer(process.env.URL_AMQP || "");
  await rabbit.start();
  rabbit.consume("messenger", message => {
    const content = JSON.parse(message.content.toString());
    const decode: any = verify(content.token, authConfig.secret);
    console.log(content.messages, decode.whatsappId);
    MessengerHandleMessage(content.messages, decode.whatsappId);
  });
};

export default MessengerConsumer;
