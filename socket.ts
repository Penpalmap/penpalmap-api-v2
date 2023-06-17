// module.exports = function (server) {
//   const io = require("socket.io")(server, {
//     pingTimeout: 60000,
//     cors: {
//       origin: `${process.env.FRONTEND_URL}`,
//     },
//   });

//   const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
//   const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";
//   const TYPING_MESSAGE_EVENT = "TYPING_MESSAGE_EVENT";
//   const NEW_CHAT_MESSAGE_EVENT = "NEW_CHAT_MESSAGE_EVENT";

//   io.on("connection", (socket) => {
//     socket.on("join-room", (roomId) => {
//       console.log("join room");
//       socket.join(roomId);
//     });

//     socket.on("leave-room", (roomId) => {
//       socket.leave(roomId);
//     });

//     socket.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
//       io.in(message.roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
//     });

//     socket.on(STOP_TYPING_MESSAGE_EVENT, (data) => {
//       io.in(data.roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
//     });
//     socket.on(TYPING_MESSAGE_EVENT, (data) => {
//       io.in(data.roomId).emit(TYPING_MESSAGE_EVENT, data);
//     });

//     // ----------CONVERSATIONS -----------------------
//   });
// };

import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";

const createSocketServer = (server: Server) => {
  const io = new SocketServer(server, {
    pingTimeout: 60000,
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
    },
  });

  const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
  const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";
  const TYPING_MESSAGE_EVENT = "TYPING_MESSAGE_EVENT";
  const NEW_CHAT_MESSAGE_EVENT = "NEW_CHAT_MESSAGE_EVENT";

  io.on("connection", (socket: Socket) => {
    socket.on("join-room", (roomId: string) => {
      console.log("join room");
      socket.join(roomId);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on(NEW_CHAT_MESSAGE_EVENT, (message: any) => {
      io.in(message.roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    });

    socket.on(STOP_TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });

    socket.on(TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(TYPING_MESSAGE_EVENT, data);
    });

    // ----------CONVERSATIONS -----------------------
  });
};

export default createSocketServer;
