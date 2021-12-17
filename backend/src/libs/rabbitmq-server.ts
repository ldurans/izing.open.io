/* eslint-disable no-useless-constructor */
import { Connection, Channel, connect, Message } from "amqplib";

export default class RabbitmqServer {
  private conn: Connection;

  private channel: Channel;

  // eslint-disable-next-line prettier/prettier
  constructor(private uri: string) { }

  async start(): Promise<void> {
    this.conn = await connect(this.uri);
    this.channel = await this.conn.createChannel();
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async publishInQueue(queue: string, message: string) {
    return this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async publishInExchange(
    exchange: string,
    routingKey: string,
    message: string
  ): Promise<boolean> {
    return this.channel.publish(exchange, routingKey, Buffer.from(message));
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async consume(queue: string, callback: (message: Message) => void) {
    return this.channel.consume(queue, (message: any) => {
      callback(message);
      this.channel.ack(message);
    });
  }
}
