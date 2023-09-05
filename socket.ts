import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { Message } from "./sequelize/models/Message";
import { onlineUsers } from "./globals";

const createSocketServer = (server: Server) => {
  const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
  const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";
  const TYPING_MESSAGE_EVENT = "TYPING_MESSAGE_EVENT";
  const NEW_CHAT_MESSAGE_EVENT = "NEW_MESSAGE";
  const SEND_MESSAGE_EVENT = "SEND_MESSAGE";
  const JOIN_ROOM_EVENT = "JOIN_ROOM";

  const io = new SocketServer(server, {
    pingTimeout: 60000,
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("add-user", (userId: string) => {
      onlineUsers.set(userId, socket.id);
    });

    socket.on("JOIN_ROOM", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("LEAVE_ROOM", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on(SEND_MESSAGE_EVENT, (message) => {
      // io.in(message.roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit(NEW_CHAT_MESSAGE_EVENT, message);
      }
    });

    // socket.on(NEW_CHAT_MESSAGE_EVENT, (message: Message) => {
    //   io.in(message.roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    // });

    socket.on(STOP_TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });

    socket.on(TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(TYPING_MESSAGE_EVENT, data);
    });
  });
};

export default createSocketServer;
