import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import {
  USER_TYPING_EVENT,
  UserTypingEventDto,
} from './dto/user-typing-event.dto';
import { RoomService } from './room.service';
import { UseFilters } from '@nestjs/common';
import { SocketExceptionsFilter } from '../shared/socket/socket-exceptions.filter';
import { Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
@UseFilters(SocketExceptionsFilter)
export class RoomGateway {
  constructor(private readonly roomService: RoomService) {}

  @SubscribeMessage(USER_TYPING_EVENT)
  async handleUserTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: UserTypingEventDto,
  ): Promise<void> {
    this.roomService.notifyUserTyping(client, message);
  }
}
