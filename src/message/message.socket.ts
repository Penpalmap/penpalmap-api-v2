import { Server as SocketServer, Socket } from 'socket.io';
import { onlineUsers } from '../globals';
import { Server } from 'http';
import { UserService } from '../user/user.service';

const TYPING_MESSAGE_EVENT = 'IS_TYPING';
const NEW_CHAT_MESSAGE_EVENT = 'NEW_MESSAGE';
const SEND_MESSAGE_EVENT = 'SEND_MESSAGE';
const JOIN_ROOM_EVENT = 'JOIN_ROOM';
const LEAVE_ROOM_EVENT = 'LEAVE_ROOM';
const SEEN_MESSAGE = 'SEEN_MESSAGE';
const SEND_SEEN_MESSAGE = 'SEND_SEEN_MESSAGE';
const ADD_USER = 'ADD_USER';
const ONLINE_USERS = 'ONLINE_USERS';
const CREATE_ROOM = 'CREATE_ROOM';
const NEW_ROOM = 'NEW_ROOM';

export class MessageSocket {
  private static instance: MessageSocket;
  private readonly userService: UserService;
  private readonly io: SocketServer;

  private constructor(server: Server) {
    this.userService = UserService.getInstance();
    this.io = new SocketServer(server, {
      pingTimeout: 60000,
      cors: {
        origin: `${process.env.FRONTEND_URL}`,
      },
    });

    this.io.on('connection', this.connect);
  }

  public static getInstance(server: Server): MessageSocket {
    if (!MessageSocket.instance) {
      MessageSocket.instance = new MessageSocket(server);
    }
    return MessageSocket.instance;
  }

  private connect(socket: Socket): void {
    // socket.on(ADD_USER, (userId: string) => this.addUser(socket, userId));
    // socket.on(JOIN_ROOM_EVENT, (roomId: string) =>
    //   this.joinRoom(socket, roomId)
    // );
    // socket.on(CREATE_ROOM, (data: { receiverId: string; roomId: string }) =>
    //   this.createRoom(socket, data)
    // );
    // socket.on(LEAVE_ROOM_EVENT, (roomId: string) =>
    //   this.leaveRoom(socket, roomId)
    // );
    // socket.on(SEND_MESSAGE_EVENT, (message: { receiverId: string }) =>
    //   this.sendMessage(socket, message)
    // );
    // socket.on(SEND_SEEN_MESSAGE, (data: { senderId: string }) =>
    //   this.sendMessageSeen(socket, data)
    // );
    // socket.on('disconnect', () => this.disconnect(socket));
    // socket.on(TYPING_MESSAGE_EVENT, (message: { receiverId: string }) =>
    //   this.sendTyping(socket, message)
    // );
  }

  private disconnect(socket: Socket): void {
    onlineUsers.forEach((value, key) => {
      if (value === socket.id) {
        onlineUsers.delete(key);
      }
    });
    this.io.emit(ONLINE_USERS, [...onlineUsers.keys()]);
  }

  private addUser(socket: Socket, userId: string): void {
    onlineUsers.set(userId, socket.id);
    this.userService.incrementUserConnection(userId);
    // envoyer à tous les utilisateurs connectés la liste des utilisateurs connectés
    this.io.emit(ONLINE_USERS, [...onlineUsers.keys()]);
  }

  private joinRoom(socket: Socket, roomId: string): void {
    socket.join(roomId);
  }

  private leaveRoom(socket: Socket, roomId: string): void {
    socket.leave(roomId);
  }

  private createRoom(
    socket: Socket,
    data: { receiverId: string; roomId: string }
  ): void {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit(NEW_ROOM, data.roomId);
    }
  }

  private sendMessage(socket: Socket, message: { receiverId: string }): void {
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit(NEW_CHAT_MESSAGE_EVENT, message);
    }
  }

  private sendMessageSeen(socket: Socket, data: { senderId: string }): void {
    const senderIdSocket = onlineUsers.get(data.senderId);
    if (senderIdSocket) {
      socket.to(senderIdSocket).emit(SEEN_MESSAGE, data);
    }
  }

  private sendTyping(socket: Socket, message: { receiverId: string }): void {
    const receiverSocketId = onlineUsers.get(message.receiverId);
    if (receiverSocketId) {
      socket.to(receiverSocketId).emit(TYPING_MESSAGE_EVENT, message);
    }
  }
}
