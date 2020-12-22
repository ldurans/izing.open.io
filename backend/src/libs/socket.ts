import socketIo, { Server as SocketIO } from "socket.io";
import socketRedis from "socket.io-redis";
import { Server } from "http";
import AppError from "../errors/AppError";
import decodeToken from "./decodeToken";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);

  if (process.env.NODE_ENV === "prod") {
    io.adapter(
      socketRedis({
        host: process.env.IO_REDIS_SERVER,
        port: Number(process.env.IO_REDIS_PORT)
        // db: process.env.IO_REDIS_DB
      })
    );
  }

  io.on("connection", socket => {
    let tenantId: string | number;
    try {
      tenantId = decodeToken(socket.handshake.query.token).tenantId;
    } catch (error) {
      console.error("Falha decode token sockect", error);
    }
    console.log("Client Connected");
    socket.on("joinChatBox", ticketId => {
      console.log("A client joined a ticket channel");
      socket.join(`${tenantId}-${ticketId}`);
    });

    socket.on("joinNotification", () => {
      console.log("A client joined notification channel");
      socket.join(`${tenantId}-notification`);
    });

    socket.on("joinTickets", status => {
      console.log(
        `A client joined to ${tenantId} - ${status} tickets channel.`
      );
      socket.join(`${tenantId}-${status}`);
    });

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
