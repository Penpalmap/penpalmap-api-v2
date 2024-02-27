import { IsUUID, Length } from 'class-validator';

export class CreateMessageDto {
  @Length(1, 65535)
  content: string;

  @IsUUID()
  senderId: string;

  @IsUUID()
  roomId: string;
}
