import { verify } from "jsonwebtoken";
import RabbitmqServer from "../../libs/rabbitmq-server";
import authConfig from "../../config/auth";
import HandleMessage360 from "./HandleMessage360";

const Consumer360 = async () => {
  const rabbit = new RabbitmqServer(process.env.AMQP_URL || "");
  await rabbit.start();
  rabbit.consume("waba360", message => {
    const content = JSON.parse(message.content.toString());
    const decode: any = verify(content.token, authConfig.secret);
    HandleMessage360(content.messages, decode.whatsappId);
  });
};

export default Consumer360;
