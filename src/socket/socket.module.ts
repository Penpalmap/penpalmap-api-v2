import { Module } from '@nestjs/common';
import { SocketGateway } from './socket.gateway';
import { SocketService } from './socket.service';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
