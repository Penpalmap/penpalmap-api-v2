import { UserDto } from '../../user/dto/user.dto';

export class RoomDto {
  id: string;
  members?: UserDto[];
}
