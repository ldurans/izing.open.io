import { Server as SocketIO } from "socket.io";
import socketRedis from "socket.io-redis";
import { Server } from "http";
import AppError from "../errors/AppError";
import decodeTokenSocket from "./decodeTokenSocket";
import { logger } from "../utils/logger";
import User from "../models/User";
import Chat from "./socketChat/Chat";

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: "*"
    },
    pingTimeout: 180000,
    pingInterval: 60000
  });

  const connRedis = {
    host: process.env.IO_REDIS_SERVER,
    port: Number(process.env.IO_REDIS_PORT),
    username: process.env.IO_REDIS_USERNAME,
    password: process.env.IO_REDIS_PASSWORD
  };

  // apresentando problema na assinatura
  const redis = socketRedis as any;
  io.adapter(redis(connRedis));

  io.use(async (socket, next) => {
    try {
      const token = socket?.handshake?.auth?.token;
      const verify = decodeTokenSocket(token);
      if (verify.isValid) {
        const auth = socket?.handshake?.auth;
        socket.handshake.auth = {
          ...auth,
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
        socket.handshake.auth.user = user;
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
    const { tenantId } = socket.handshake.auth;
    if (tenantId) {
      logger.info({
        message: "Client connected in tenant",
        data: socket.handshake.auth
      });

      // create room to tenant
      socket.join(tenantId.toString());

      socket.on(`${tenantId}:joinChatBox`, ticketId => {
        logger.info(`Client joined a ticket channel ${tenantId}:${ticketId}`);
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

    socket.on("disconnect", (reason: any) => {
      logger.info({
        message: `SOCKET Client disconnected , ${tenantId}, ${reason}`
      });
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
