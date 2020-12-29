import socketIo, { Server as SocketIO } from "socket.io";
import socketRedis from "socket.io-redis";
import { Server } from "http";
import AppError from "../errors/AppError";
import decodeTokenSocket from "./decodeTokenSocket";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);
  io.adapter(
    socketRedis({
      host: process.env.IO_REDIS_SERVER,
      port: Number(process.env.IO_REDIS_PORT)
    })
  );

  io.use((socket, next) => {
    try {
      const token = socket?.handshake?.query?.token;
      const verify = decodeTokenSocket(token);
      if (verify.isValid) {
        const query = socket?.handshake?.query;
        socket.handshake.query = { ...query, ...verify.data };
        next();
      }
      next(new Error("authentication error"));
    } catch (error) {
      console.log("tokenInvalid", socket);
      socket.emit(`tokenInvalid-${socket.id}`);
      next(new Error("authentication error"));
    }
  });

  io.on("connection", socket => {
    console.log("Client Connected", socket);
    const { tenantId } = socket.handshake.query;
    if (tenantId) {
      console.log("Client Connected in tenant", tenantId);
      socket.on(`${tenantId}-joinChatBox`, ticketId => {
        console.log(
          "A client joined a ticket channel",
          `${tenantId}-${ticketId}`
        );
        socket.join(`${tenantId}-${ticketId}`);
      });

      socket.on(`${tenantId}-joinNotification`, () => {
        console.log(
          "A client joined notification channel",
          `${tenantId}-notification`
        );
        socket.join(`${tenantId}-notification`);
      });
      socket.on(`${tenantId}-joinTickets`, status => {
        console.log(
          `A client joined to ${tenantId} - ${status} tickets channel.`
        );
        socket.join(`${tenantId}-${status}`);
      });
    }

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });
  return io;
};
export const getIO = (): SocketIO => {
  if (!io) {
    throw new AppError("Socket IO not initialized");
  }
  return io;
};
