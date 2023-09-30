import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { onlineUsers } from "./globals";
import { userService } from "./src/services/userService";

const createSocketServer = (server: Server) => {
  const START_TYPING_MESSAGE_EVENT = "START_TYPING_MESSAGE_EVENT";
  const STOP_TYPING_MESSAGE_EVENT = "STOP_TYPING_MESSAGE_EVENT";
  const TYPING_MESSAGE_EVENT = "TYPING_MESSAGE_EVENT";
  const NEW_CHAT_MESSAGE_EVENT = "NEW_MESSAGE";
  const SEND_MESSAGE_EVENT = "SEND_MESSAGE";
  const JOIN_ROOM_EVENT = "JOIN_ROOM";
  const LEAVE_ROOM_EVENT = "LEAVE_ROOM";
  const SEEN_MESSAGE = "SEEN_MESSAGE";
  const SEND_SEEN_MESSAGE = "SEND_SEEN_MESSAGE";

  const io = new SocketServer(server, {
    pingTimeout: 60000,
    cors: {
      origin: `${process.env.FRONTEND_URL}`,
    },
  });

  io.on("connection", (socket: Socket) => {
    socket.on("add-user", (userId: string) => {
      onlineUsers.set(userId, socket.id);
      userService.incrementUserConnection(userId);
    });

    socket.on(JOIN_ROOM_EVENT, (roomId: string) => {
      socket.join(roomId);
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
      console.log("SEND_SEEN_MESSAGE", data);
      const senderIdSocket = onlineUsers.get(data.senderId);
      if (senderIdSocket) {
        console.log("receiverSocketId", senderIdSocket);
        socket.to(senderIdSocket).emit(SEEN_MESSAGE, data);
      }
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
      onlineUsers.forEach((value, key) => {
        if (value === socket.id) {
          onlineUsers.delete(key);
        }
      });
    });

    socket.on(STOP_TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(STOP_TYPING_MESSAGE_EVENT, data);
    });

    socket.on(TYPING_MESSAGE_EVENT, (data: any) => {
      io.in(data.roomId).emit(TYPING_MESSAGE_EVENT, data);
    });
  });
};

export default createSocketServer;
