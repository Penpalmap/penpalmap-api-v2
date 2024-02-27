import { Module } from '@nestjs/common';
import { RoomService } from './room.service';
import { RoomController } from './room.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import Room from './room.model';

@Module({
  imports: [TypeOrmModule.forFeature([Room]), UserModule],
  exports: [RoomService],
  providers: [RoomService],
  controllers: [RoomController],
})
export class RoomModule {}
