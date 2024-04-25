import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from './message.model';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';
import { SocketModule } from '../socket/socket.module';
import { MailjetModule } from '../mailjet/mailjet.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Message]),
    UserModule,
    RoomModule,
    SocketModule,
    MailjetModule,
  ],
  controllers: [MessageController],
  providers: [MessageService],
  exports: [MessageService],
})
export class MessageModule {}
