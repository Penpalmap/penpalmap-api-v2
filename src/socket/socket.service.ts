import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { Server, Socket } from 'socket.io';
import { SocketEventType } from './socket.config';
import { onlineUsers } from '../global';
import { CreateRoomEventDto } from './dto/create-room-event.dto';
import { SendMessageEventDto } from './dto/send-message-event.dto';
import { SendMessageSeenDto } from './dto/send-message-seen.dto';
import { SendTypingEventDto } from './dto/send-typing-event.dto';

@Injectable()
export class SocketService {
  constructor(private readonly userService: UserService) {}

  handleAddUser(server: Server, client: Socket, userId: string): void {
    onlineUsers.set(userId, client.id);
    this.userService.incrementUserConnection(userId);
    server.emit(SocketEventType.ONLINE_USERS, [...onlineUsers.keys()]);
  }

  handleJoinRoom(client: Socket, roomId: string): void {
    client.join(roomId);
  }

  handleLeaveRoom(client: Socket, roomId: string): void {
    client.leave(roomId);
  }

  handleCreateRoom(client: Socket, data: CreateRoomEventDto): void {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      client.to(receiverSocketId).emit(SocketEventType.NEW_ROOM, data.roomId);
    }
  }

  handleSendMessage(client: Socket, data: SendMessageEventDto): void {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      client
        .to(receiverSocketId)
        .emit(SocketEventType.NEW_CHAT_MESSAGE_EVENT, data);
    }
  }

  handleSendMessageSeen(client: Socket, data: SendMessageSeenDto): void {
    const senderSocketId = onlineUsers.get(data.senderId);
    if (senderSocketId) {
      client.to(senderSocketId).emit(SocketEventType.SEEN_MESSAGE, data);
    }
  }

  handleSendTyping(client: Socket, data: SendTypingEventDto): void {
    const receiverSocketId = onlineUsers.get(data.receiverId);
    if (receiverSocketId) {
      client
        .to(receiverSocketId)
        .emit(SocketEventType.TYPING_MESSAGE_EVENT, data);
    }
  }

  handleDisconnect(server: Server, client: Socket): void {
    onlineUsers.forEach((value, key) => {
      if (value === client.id) {
        onlineUsers.delete(key);
      }
    });
    server.emit(SocketEventType.ONLINE_USERS, [...onlineUsers.keys()]);
  }
}
