import { IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsUUID('4', { each: true })
  memberIds: string[];
}
