/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import {
  each,
  sortBy,
  fromPairs,
  map,
  forEach,
  isNull,
  findKey,
  isUndefined
} from "lodash";
import { Socket } from "socket.io";

export const sortByKeys = (obj: any) => {
  const keys = Object.keys(obj);
  const sortedKeys = sortBy(keys);
  return fromPairs(
    map(sortedKeys, key => {
      return [key, obj[key]];
    })
  );
};

export const sendToSelf = (socket: Socket, method: any, data: any = {}) => {
  socket.emit(method, data);
};

export const _sendToSelf = (
  io: { sockets: { sockets: any } },
  socketId: any,
  method: any,
  data: any
) => {
  each(io.sockets.sockets, socket => {
    if (socket.id === socketId) {
      socket.emit(method, data);
    }
  });
};

export const sendToAllConnectedClients = (
  socket: Socket,
  method: any,
  data: any
) => {
  socket.emit(method, data);
};

export const sendToAllClientsInRoom = (
  io: any,
  room: any,
  method: any,
  data: any
) => {
  io.sockets.in(room).emit(method, data);
};

export const sendToUser = (
  socketList: any,
  userList: any,
  username: any,
  method: any,
  data: any
) => {
  let userOnline: any = null;
  forEach(userList, (v, k) => {
    if (k.toLowerCase() === username.toLowerCase()) {
      userOnline = v;
      return true;
    }
  });

  if (isNull(userOnline)) return true;

  forEach(userOnline?.sockets, socket => {
    const o = findKey(socketList, { id: socket });
    if (o) {
      const i = o ? socketList[o] : null;
      if (isUndefined(i)) return true;
      i.emit(method, data);
    }
  });
};

export const sendToAllExcept = (
  io: any,
  exceptSocketId: any,
  method: any,
  data: any
) => {
  each(io.sockets.sockets, socket => {
    if (socket.id !== exceptSocketId) {
      socket.emit(method, data);
    }
  });
};

export const disconnectAllClients = (io: any) => {
  Object.keys(io.sockets.sockets).forEach(sock => {
    io.sockets.sockets[sock].disconnect(true);
  });
};
