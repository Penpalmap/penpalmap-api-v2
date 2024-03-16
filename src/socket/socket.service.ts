import { Injectable } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { onlineUsers } from '../global';
import { Socket } from 'socket.io';

@Injectable()
export class SocketService {
  constructor(private readonly socketGateway: SocketGateway) {}

  sendMessage<T>(event: string, message: T, userIds?: string[]): void {
    const socketIds = userIds
      ? Array.from(onlineUsers.entries())
          .filter(([userId, _]) => userIds.includes(userId))
          .map(([_, socketId]) => socketId)
      : undefined;
    const clients = socketIds
      ? Array.from(this.socketGateway.server.sockets.sockets.entries())
          .filter(([socketId, _]) => socketIds.includes(socketId))
          .map(([_, socket]) => socket)
      : Array.from(this.socketGateway.server.sockets.sockets.values());
    clients.forEach((client) => client.emit(event, message));
  }

  static isHandledByThisClient(userId: string, client: Socket): boolean {
    return onlineUsers.get(userId) === client.id;
  }
}
