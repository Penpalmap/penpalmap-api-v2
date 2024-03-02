import { UserDto } from '../../user/dto/user.dto';

export class MessageDto {
  id: string;
  content: string;
  isSeen: boolean;
  sender?: UserDto;
  createdAt: Date;
  updatedAt: Date;
}
