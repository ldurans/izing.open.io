import socketIo, { Server as SocketIO } from "socket.io";
import socketRedis from "socket.io-redis";
import { Server } from "http";
import { WAState } from "whatsapp-web.js";
import AppError from "../errors/AppError";
import decodeTokenSocket from "./decodeTokenSocket";
import { logger } from "../utils/logger";
import User from "../models/User";
import Chat from "./socketChat/Chat";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = socketIo(httpServer);
  io.adapter(
    socketRedis({
      host: process.env.IO_REDIS_SERVER,
      port: Number(process.env.IO_REDIS_PORT)
    })
  );

  io.use(async (socket, next) => {
    try {
      const token = socket?.handshake?.query?.token;
      const verify = decodeTokenSocket(token);
      if (verify.isValid) {
        const query = socket?.handshake?.query;
        socket.handshake.query = {
          ...query,
          ...verify.data,
          id: String(verify.data.id),
          tenantId: String(verify.data.tenantId)
        };

        const user = await User.findByPk(verify.data.id, {
          attributes: [
            "id",
            "tenantId",
            "name",
            "email",
            "profile",
            "status",
            "lastLogin",
            "lastOnline"
          ]
        });
        socket.auth = verify.data;
        socket.user = user;
        next();
      }
      next(new Error("authentication error"));
    } catch (error) {
      logger.warn(`tokenInvalid: ${socket}`);
      socket.emit(`tokenInvalid:${socket.id}`);
      next(new Error("authentication error"));
    }
  });

  io.on("connection", socket => {
    const { tenantId } = socket.handshake.query;
    if (tenantId) {
      logger.info({
        message: "Client connected in tenant",
        data: socket.handshake.query
      });

      socket.join(tenantId.toString());

      socket.on(`${tenantId}:joinChatBox`, ticketId => {
        console.info({
          message: `Client joined a ticket channel ${tenantId}:${ticketId}`
        });
        socket.join(`${tenantId}:${ticketId}`);
      });

      socket.on(`${tenantId}:joinNotification`, () => {
        logger.info(
          `A client joined notification channel ${tenantId}:notification`
        );
        socket.join(`${tenantId}:notification`);
      });
      socket.on(`${tenantId}:joinTickets`, status => {
        logger.info(
          `A client joined to ${tenantId}:${status} tickets channel.`
        );
        socket.join(`${tenantId}:${status}`);
      });
      Chat.register(socket);
    }

    socket.on("disconnect", (reason: WAState) => {
      logger.info({ message: "Client disconnected", tenantId, reason });
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
