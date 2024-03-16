import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Room from './room.model';
import { SocketModule } from '../socket/socket.module';
import { RoomGateway } from './room.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), UserModule, SocketModule],
  exports: [RoomService],
  providers: [RoomService, RoomGateway],
  controllers: [RoomController],
})
export class RoomModule {}
