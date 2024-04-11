import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { LOGGED_IN_EVENT, LoggedInEventDto } from './dto/logged-in-event.dto';
import { AuthService } from './auth.service';
import { Socket } from 'socket.io';
import {
  LOGGED_OUT_EVENT,
  LoggedOutEventDto,
} from './dto/logged-out-event.dto';
import { UseFilters } from '@nestjs/common';
import { SocketExceptionsFilter } from '../shared/socket/socket-exceptions.filter';

@WebSocketGateway({ cors: true })
@UseFilters(SocketExceptionsFilter)
export class AuthGateway implements OnGatewayDisconnect {
  constructor(private readonly authService: AuthService) {}

  @SubscribeMessage(LOGGED_IN_EVENT)
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: LoggedInEventDto,
  ): Promise<void> {
    await this.authService.loginSocketUser(client, message);
  }

  @SubscribeMessage(LOGGED_OUT_EVENT)
  async handleLoggedOut(
    @ConnectedSocket() client: Socket,
    @MessageBody() dto: LoggedOutEventDto,
  ): Promise<void> {
    await this.authService.logoutSocketUser(client, dto);
  }

  async handleDisconnect(client: Socket): Promise<void> {
    await this.authService.logoutSocketUser(client);
  }
}
