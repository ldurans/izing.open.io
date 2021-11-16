// import { sortBy, fromPairs, map } from "lodash";
// import User from "../../models/User";

// function sortByKeys(obj: any) {
//   const keys = Object.keys(obj);
//   const sortedKeys = sortBy(keys);
//   return fromPairs(
//     map(sortedKeys, key => {
//       return [key, obj[key]];
//     })
//   );
// }

// const sharedVars: any = {
//   sockets: {},
//   usersOnline: {},
//   idleUsers: {}
// };

// const events = {};

// function register(socket) {
//   events.onSetUserIdle(socket);
//   events.onSetUserActive(socket);
//   events.onUpdateUsers(socket);
//   events.updateOnlineBubbles(socket);
//   events.updateConversationsNotifications(socket);
//   events.spawnChatWindow(socket);
//   events.getOpenChatWindows(socket);
//   events.onChatMessage(socket);
//   events.onChatTyping(socket);
//   events.onChatStopTyping(socket);
//   events.saveChatWindow(socket);
//   events.onDisconnect(socket);

//   if (socket.request.user.logged_in) {
//     joinChatServer(socket);
//   }
// }

// function eventLoop() {
//   updateUsers();
//   updateOnlineBubbles();
//   updateConversationsNotifications();
// }

// function joinChatServer(socket: any) {
//   const user = JSON.parse(socket.user);
//   const propTenant = `tenantId-${user.tenantId}`
//   const propUser = `userId-${user.id}`
//   let exists = false;

//   if (!sharedVars.usersOnline.hasOwnProperty(propTenant)) {
//     sharedVars.usersOnline[propTenant] = {}
//   }
//   if (!sharedVars.sockets.hasOwnProperty(propTenant)) {
//     sharedVars.sockets[propTenant] = {}
//   }
//   if (!sharedVars.idleUsers.hasOwnProperty(propTenant)) {
//     sharedVars.idleUsers[propTenant] = {}
//   }

//   if (
//     sharedVars.usersOnline[propTenant].hasOwnProperty(user.mail)
//   ) {
//     exists = true;
//   }

//   // let sortedUserList;

//   if (!exists) {
//     if (shared.usersOnline[tenantId].length !== 0) {
//       objShared[tenantId].usersOnline.push({
//         sockets: [socket.id], user: {
//           ...user,
//           socketId:
//       }
//       });
//       // sortedUserList = sharedUtils.sortByKeys(sharedVars.usersOnline)

//       // utils.sendToSelf(socket, "joinSuccessfully");
//       objShared[tenantId].sockets.push(socket);

//       // spawnOpenChatWindows(socket, user._id);
//     }
//   } else {
//     sharedVars.usersOnline[user.username].sockets.push(socket.id);
//     utils.sendToSelf(socket, "joinSuccessfully");

//     // sortedUserList = sharedUtils.sortByKeys(sharedVars.usersOnline)
//     // utils.sendToAllConnectedClients(io, 'updateUsers', sortedUserList)
//     sharedVars.sockets.push(socket);

//     spawnOpenChatWindows(socket, user._id);
//   }
// }

// module.exports = {
//   events,
//   eventLoop,
//   register
// };
