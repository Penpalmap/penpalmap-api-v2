import { IsOptional, IsUUID } from 'class-validator';

export class QueryRoomDto {
  @IsOptional()
  @IsUUID('4', { each: true })
  userIds?: string[];
}
