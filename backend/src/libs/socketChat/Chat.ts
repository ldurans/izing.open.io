/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-prototype-builtins */
import { Socket } from "socket.io";
import {
  find,
  findKey,
  forEach,
  fromPairs,
  isNull,
  size,
  sortBy,
  toPairs,
  without
} from "lodash";
import {
  sendToAllConnectedClients,
  sendToSelf,
  sendToUser,
  sortByKeys
} from "./Utils";
import { shared } from "./Index";
import User from "../../models/User";
import { logger } from "../../utils/logger";

const events: any = {};

const JoinChatServer = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  logger.info(`joinChatServer USER ${user.name}`);
  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;
  let dataTenant: any;

  // dataTenant = await getValue(socketDataTenant);
  dataTenant = shared[socketDataTenant];
  if (dataTenant) {
    dataTenant.usersOnline[user.id] = {
      sockets: [socket.id],
      user
    };
    dataTenant.sockets.push(socket);
    sendToSelf(socket, "joinSuccessfully");
  }

  if (!dataTenant) {
    shared[socketDataTenant] = {
      sockets: [],
      usersOnline: {},
      idleUsers: {}
    };
    dataTenant = shared[socketDataTenant];
    dataTenant.usersOnline[user.id] = {
      sockets: [socket.id],
      user
    };
    dataTenant.sockets.push(socket);
    sendToSelf(socket, `${user.tenantId}:joinSuccessfully`);
  }
};

const UpdateUsers = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const socketDataTenant = `socketData_${user.tenantId}`;
  const dataTenant = shared[socketDataTenant];

  const sortedUserList = sortByKeys(dataTenant.usersOnline);
  forEach(sortedUserList, v => {
    const userValue = v.user;
    const { sockets } = v;
    if (userValue && sockets.length > 0) {
      forEach(sockets, sock => {
        const socketFind = find(dataTenant.sockets, s => {
          return s.id === sock;
        });

        if (socketFind) {
          if (userValue.role.isAdmin || userValue.role.isAgent) {
            socketFind.emit("updateUsers", sortedUserList);
          }
          // else {
          //   const groupSchema = require("../models/group");
          //   groupSchema.getAllGroupsOfUser(user._id, function (err, groups) {
          //     if (!err) {
          //       let usersOfGroups = _.map(groups, function (g) {
          //         return _.map(g.members, function (m) {
          //           return { user: m };
          //         });
          //       });

          //       const agentsAndAdmins = chain(sortedUserList)
          //         .filter(function (u) {
          //           return u.user.role.isAdmin || u.user.role.isAgent;
          //         })
          //         .map(function (u) {
          //           return u;
          //         })
          //         .value();

          //       usersOfGroups = concat(usersOfGroups, agentsAndAdmins);

          //       let onlineUsernames = map(sortedUserList, function (u) {
          //         return u.user.username;
          //       });
          //       onlineUsernames = flattenDeep(onlineUsernames);

          //       const sortedUsernames = chain(usersOfGroups)
          //         .flattenDeep()
          //         .map(function (u) {
          //           return u.user.username;
          //         })
          //         .value();

          //       const actual = intersection(onlineUsernames, sortedUsernames);

          //       usersOfGroups = chain(usersOfGroups)
          //         .flattenDeep()
          //         .filter(function (i) {
          //           return actual.indexOf(i.user.username) !== -1;
          //         })
          //         .uniqBy(function (i) {
          //           return i.user._id;
          //         })
          //         .value();

          //       const sortedKeys = map(usersOfGroups, function (m) {
          //         return m.user.username;
          //       });

          //       const obj = zipObject(sortedKeys, usersOfGroups);

          //       socket.emit("updateUsers", obj);
          //     }
          //   });
          // }
        }
      });
    }
  });
  // utils.sendToAllConnectedClients(io, 'updateUsers', sortedUserList)
};

const UpdateOnlineBubbles = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const socketDataTenant = `socketData_${user.tenantId}`;
  const dataTenant = shared[socketDataTenant];
  const sortedUserList = fromPairs(
    sortBy(toPairs(dataTenant.usersOnline), o => {
      return o[0];
    })
  );
  const sortedIdleList = fromPairs(
    sortBy(toPairs(dataTenant.idleUsers), o => {
      return o[0];
    })
  );

  sendToAllConnectedClients(
    socket,
    `${user.tenantId}:chat:updateOnlineBubbles`,
    {
      sortedUserList,
      sortedIdleList
    }
  );
};

const SpawnOpenChatWindows = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const userSchema = User.findByPk(user.id);
  // const conversationSchema = require("../models/chat/conversation");
  // buscar e devolver a conversa
  sendToSelf(socket, "spawnChatWindow", userSchema);
};

const spawnChatWindow = (socket: Socket) => {
  socket.on("spawnChatWindow", async (userId: number) => {
    // Get user
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email", "profile"]
    });
    sendToSelf(socket, "spawnChatWindow", user);
  });
};

const onSetUserIdle = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const socketDataTenant = `socketData_${user.tenantId}`;
  socket.on(`${user.tenantId}:setUserIdle`, () => {
    let dataTenant: any;
    dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      dataTenant.idleUsers[user.id] = {
        sockets: [socket.id],
        user
      };
    }
    if (!dataTenant) {
      shared[socketDataTenant] = {
        sockets: [],
        usersOnline: {},
        idleUsers: {}
      };
      dataTenant = shared[socketDataTenant];
      dataTenant.idleUsers.push(socket.id);
    }
    if (dataTenant?.usersOnline[user.id]) {
      delete dataTenant?.usersOnline[user.id];
    }
    UpdateOnlineBubbles(socket);
  });
};

const onSetUserActive = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const socketDataTenant = `socketData_${user.tenantId}`;

  socket.on(`${user.tenantId}:setUserActive`, () => {
    let dataTenant = shared[socketDataTenant];

    if (dataTenant?.idleUsers[user.id]) {
      delete dataTenant?.idleUsers[user.id];
    }

    if (!dataTenant) {
      shared[socketDataTenant] = {
        sockets: [],
        usersOnline: {},
        idleUsers: {}
      };
      dataTenant = shared[socketDataTenant];
      dataTenant.usersOnline.push(socket.id);
    }

    if (dataTenant?.usersOnline) {
      dataTenant.usersOnline[user.id] = {
        sockets: [socket.id],
        user
      };
    }

    UpdateOnlineBubbles(socket);
  });
};

const onUpdateUsers = (socket: Socket) => {
  socket.on("updateUsers", UpdateUsers);
};

const onChatMessage = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;
  socket.on("chatMessage", function (data) {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      const { from } = data;
      console.log("TO", to);
      console.log("FROM", from);
      const od = data.type;
      if (data.type === "s") {
        data.type = "r";
      } else {
        data.type = "s";
      }

      // buscar o usuario para chat (to)
      // Buscar o usuario de (from)
      // se error
      // // return utils.sendToSelf(socket, "chatMessage", { message: err });
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        data.toUser.username,
        "chatMessage",
        data
      );
      data.type = od;
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        data.fromUser.username,
        "chatMessage",
        data
      );
    }
  });
};

const onChatTyping = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;

  socket.on("chatTyping", data => {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      const { from } = data;

      let toUser: any = null;
      let fromUser: any = null;
      find(dataTenant.usersOnline, function (v) {
        if (String(v.user.id) === String(to)) {
          toUser = v.user;
        }

        if (String(v.user.id) === String(from)) {
          fromUser = v.user;
        }
      });

      if (isNull(toUser) || isNull(fromUser)) {
        return;
      }

      data.toUser = toUser;
      data.fromUser = fromUser;

      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        toUser.name,
        "chatTyping",
        data
      );
    }
  });
};

const onChatStopTyping = (socket: Socket) => {
  const { user } = socket.handshake.auth;
  const { tenantId } = user;
  const socketDataTenant = `socketData_${tenantId}`;
  socket.on("chatStopTyping", data => {
    const dataTenant = shared[socketDataTenant];
    if (dataTenant) {
      const { to } = data;
      let toUser: any = null;
      find(dataTenant.usersOnline, v => {
        if (String(v.user.id) === String(to)) {
          toUser = v.user;
        }
      });
      if (isNull(toUser)) {
        return;
      }
      data.toUser = toUser;
      sendToUser(
        dataTenant.sockets,
        dataTenant.usersOnline,
        toUser.name,
        "chatStopTyping",
        data
      );
    }
  });
};

const saveChatWindow = (socket: Socket) => {
  socket.on("saveChatWindow", async data => {
    const { userId } = data;
    // const { convoId } = data;
    const { remove } = data;
    const userSchema = await User.findByPk(userId);
    if (userSchema) {
      if (remove) {
        // remover o chat do usuário
        // user.removeOpenChatWindow(convoId)
      } else {
        // adiciona o chat ao usuario
        // user.addOpenChatWindow(convoId)
      }
    }
  });
};

const onDisconnect = (socket: Socket) => {
  socket.on("disconnect", async reason => {
    const { user } = socket.handshake.auth;

    const { tenantId } = user;
    const socketDataTenant = `socketData_${tenantId}`;
    const dataTenant = shared[socketDataTenant];
    if (dataTenant?.usersOnline) {
      if (dataTenant.usersOnline[user.id]) {
        const userSockets = dataTenant.usersOnline[user.id].sockets;
        if (size(userSockets) < 2) {
          delete dataTenant.usersOnline[user.id];
        } else {
          dataTenant.usersOnline[user.id].sockets = without(
            userSockets,
            socket.id
          );
        }
      }
      const o = findKey(dataTenant.sockets, { id: socket.id });
      dataTenant.sockets = without(dataTenant.sockets, o);
    }

    if (dataTenant?.idleUsers) {
      if (dataTenant.idleUsers[user.id]) {
        const idleSockets = dataTenant.idleUsers[user.id].sockets;
        if (size(idleSockets) < 2) {
          delete dataTenant.idleUsers[user.id];
        } else {
          dataTenant.idleUsers[user.id].sockets = without(
            idleSockets,
            socket.id
          );
        }
      }
      const i = findKey(dataTenant.sockets, { id: socket.id });
      dataTenant.sockets = without(dataTenant.sockets, i);
    }

    // Save lastOnline Time
    const instance = await User.findByPk(user.id);
    instance?.update({ status: "offline", lastOnline: new Date() });
    UpdateOnlineBubbles(socket);

    if (reason === "transport error") {
      reason = "client terminated";
    }
    logger.debug(`User disconnected (${reason}): ${user.name} - ${socket.id}`);
  });
};

events.onSetUserIdle = onSetUserIdle;
events.onSetUserActive = onSetUserActive;
events.onUpdateUsers = onUpdateUsers;
events.spawnChatWindow = spawnChatWindow;
events.onChatMessage = onChatMessage;
events.onChatTyping = onChatTyping;
events.onChatStopTyping = onChatStopTyping;
events.saveChatWindow = saveChatWindow;
events.onDisconnect = onDisconnect;
events.updateOnlineBubbles = (socket: Socket) => {
  const { user } = socket.handshake.auth;

  socket.on(`${user.tenantId}:chat:updateOnlineBubbles`, () => {
    UpdateOnlineBubbles(user.tenantId);
  });
};
events.getOpenChatWindows = (socket: Socket) => {
  socket.on("getOpenChatWindows", () => {
    SpawnOpenChatWindows(socket);
  });
};

function register(socket: Socket): void {
  if (!socket.handshake?.auth?.tenantId) {
    return;
  }

  events.onSetUserIdle(socket);
  events.onSetUserActive(socket);
  events.onUpdateUsers(socket);
  events.updateOnlineBubbles(socket);
  // events.updateConversationsNotifications(socket);
  events.spawnChatWindow(socket);
  events.getOpenChatWindows(socket);
  events.onChatMessage(socket);
  events.onChatTyping(socket);
  events.onChatStopTyping(socket);
  events.saveChatWindow(socket);
  events.onDisconnect(socket);

  if (socket.handshake.auth.user.id) {
    JoinChatServer(socket);
  }
}

const eventLoop = (socket: Socket) => {
  UpdateUsers(socket);
  UpdateOnlineBubbles(socket);
  // updateConversationsNotifications()
};

const chat = {
  events,
  eventLoop,
  register
};

export default chat;
