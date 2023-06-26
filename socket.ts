import { Server } from "http";
import { Server as SocketServer, Socket } from "socket.io";
import { Message } from "./sequelize/models/Message";

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
  const NEW_CHAT_MESSAGE_EVENT = "NEW_MESSAGE";

  io.on("connection", (socket: Socket) => {
    socket.on("JOIN_ROOM", (roomId: string) => {
      socket.join(roomId);
    });

    socket.on("LEAVE_ROOM", (roomId: string) => {
      socket.leave(roomId);
    });

    socket.on(NEW_CHAT_MESSAGE_EVENT, (message: Message) => {
      io.in(message.roomId).emit(NEW_CHAT_MESSAGE_EVENT, message);
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
