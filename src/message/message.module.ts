import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import Message from './message.model';
import { UserModule } from '../user/user.module';
import { RoomModule } from '../room/room.module';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), UserModule, RoomModule],
  controllers: [MessageController],
  providers: [MessageService],
})
export class MessageModule {}
