import { RoomDto } from '../../room/dto/room.dto';
import { UserDto } from '../../user/dto/user.dto';

export class MessageDto {
  id: string;
  content: string;
  isSeen: boolean;
  sender?: UserDto;
  room?: RoomDto;
  createdAt: Date;
  updatedAt: Date;
}
