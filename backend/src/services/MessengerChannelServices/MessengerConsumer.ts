import { verify } from "jsonwebtoken";
import RabbitmqServer from "../../libs/rabbitmq-server";
import authConfig from "../../config/auth";
import MessengerHandleMessage from "./MessengerHandleMessage";

const MessengerConsumer = async () => {
  const rabbit = new RabbitmqServer(process.env.AMQP_URL || "");
  await rabbit.start();
  rabbit.consume("messenger", message => {
    const content = JSON.parse(message.content.toString());
    const decode: any = verify(content.token, authConfig.secret);
    if (!decode) return;
    MessengerHandleMessage(content.messages);
  });
};

export default MessengerConsumer;
