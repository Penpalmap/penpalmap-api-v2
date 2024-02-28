import { ArrayMinSize, IsUUID } from 'class-validator';

export class CreateRoomDto {
  @IsUUID('4', { each: true })
  @ArrayMinSize(2)
  memberIds: string[];
}
