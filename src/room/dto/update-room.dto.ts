import { IsOptional, IsUUID } from 'class-validator';

export class UpdateRoomDto {
  @IsOptional()
  @IsUUID('4', { each: true })
  memberIds?: string[];
}
