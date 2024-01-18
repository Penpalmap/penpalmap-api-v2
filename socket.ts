import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { onlineUsers } from "./globals";
import { userService } from "./src/services/userService";
import { Room } from "./sequelize/models/Room";

const createSocketServer = (server: Server) => {
  const TYPING_MESSAGE_EVENT = "IS_TYPING";
  const NEW_CHAT_MESSAGE_EVENT = "NEW_MESSAGE";
  const SEND_MESSAGE_EVENT = "SEND_MESSAGE";
  const JOIN_ROOM_EVENT = "JOIN_ROOM";
  const LEAVE_ROOM_EVENT = "LEAVE_ROOM";
  const SEEN_MESSAGE = "SEEN_MESSAGE";
  const SEND_SEEN_MESSAGE = "SEND_SEEN_MESSAGE";
  const ADD_USER = "ADD_USER";
  const ONLINE_USERS = "ONLINE_USERS";
  const CREATE_ROOM = "CREATE_ROOM";
  const NEW_ROOM = "NEW_ROOM";

  const io = new SocketServer(server, {
    pingTimeout: 60000,
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on(ADD_USER, (userId: string) => {
      onlineUsers.set(userId, socket.id);
      userService.incrementUserConnection(userId);
      // envoyer à tous les utilisateurs connectés la liste des utilisateurs connectés
      io.emit(ONLINE_USERS, [...onlineUsers.keys()]);
    });

    socket.on(JOIN_ROOM_EVENT, (roomId: string) => {
      socket.join(roomId);
    });

    socket.on(CREATE_ROOM, (data: any) => {
      const receiverSocketId = onlineUsers.get(data.receiverId);
      if (receiverSocketId) {
        console.log("SEEEEEEEEEEEEEEEEEEEEEEND");
        socket.to(receiverSocketId).emit(NEW_ROOM, data.roomId);
      }
    });

    socket.on(LEAVE_ROOM_EVENT, (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on(SEND_MESSAGE_EVENT, (message) => {
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit(NEW_CHAT_MESSAGE_EVENT, message);
      }
    });

    socket.on(SEND_SEEN_MESSAGE, (data: any) => {
      const senderIdSocket = onlineUsers.get(data.senderId);
      if (senderIdSocket) {
        socket.to(senderIdSocket).emit(SEEN_MESSAGE, data);
      }
    });

    socket.on("disconnect", () => {
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      });
      io.emit(ONLINE_USERS, [...onlineUsers.keys()]);
    });

    socket.on(TYPING_MESSAGE_EVENT, (message: any) => {
      const receiverSocketId = onlineUsers.get(message.receiverId);
      if (receiverSocketId) {
        socket.to(receiverSocketId).emit(TYPING_MESSAGE_EVENT, message);
      }
    });
  });
};

export default createSocketServer;
