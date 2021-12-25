import { verify } from "jsonwebtoken";
import RabbitmqServer from "../../libs/rabbitmq-server";
import { logger } from "../../utils/logger";
import authConfig from "../../config/auth";
import HandleMessage360 from "./HandleMessage360";

const Consumer360 = async () => {
  const rabbit = new RabbitmqServer(process.env.URL_AMQP || "");
  await rabbit.start();
  rabbit.consume("waba360", message => {
    console.log("THIS", this);
    const content = JSON.parse(message.content.toString());
    console.log("content", content);
    const decode: any = verify(content.token, authConfig.secret);
    // const { tenantId, whatsappId } = decode;
    console.log(decode);
    HandleMessage360(content.messages, decode.whatsappId);
    // throw new Error("error consume");
  });
};

export default Consumer360;
