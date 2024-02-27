import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { SocketService } from './socket.service';
import { SocketEventType } from './socket.config';
import { CreateRoomEventDto } from './dto/create-room-event.dto';
import { SendMessageEventDto } from './dto/send-message-event.dto';
import { SendMessageSeenDto } from './dto/send-message-seen.dto';
import { SendTypingEventDto } from './dto/send-typing-event.dto';

@WebSocketGateway()
export class SocketGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  private readonly server: Server;

  constructor(private readonly socketService: SocketService) {}

  @SubscribeMessage(SocketEventType.ADD_USER)
  handleAddUser(
    @ConnectedSocket() client: Socket,
    @MessageBody() userId: string,
  ): void {
    this.socketService.handleAddUser(this.server, client, userId);
  }

  @SubscribeMessage(SocketEventType.JOIN_ROOM_EVENT)
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): void {
    this.handleJoinRoom(client, roomId);
  }

  @SubscribeMessage(SocketEventType.LEAVE_ROOM_EVENT)
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ): void {
    this.handleLeaveRoom(client, roomId);
  }

  @SubscribeMessage(SocketEventType.CREATE_ROOM)
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateRoomEventDto,
  ): void {
    this.handleCreateRoom(client, data);
  }

  @SubscribeMessage(SocketEventType.SEND_MESSAGE_EVENT)
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageEventDto,
  ): void {
    this.handleSendMessage(client, data);
  }

  @SubscribeMessage(SocketEventType.SEND_SEEN_MESSAGE)
  handleSendMessageSeen(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendMessageSeenDto,
  ): void {
    this.handleSendMessageSeen(client, data);
  }

  @SubscribeMessage(SocketEventType.TYPING_MESSAGE_EVENT)
  handleSendTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: SendTypingEventDto,
  ): void {
    this.handleSendTyping(client, data);
  }

  handleDisconnect(client: Socket): void {
    this.socketService.handleDisconnect(this.server, client);
  }
}
