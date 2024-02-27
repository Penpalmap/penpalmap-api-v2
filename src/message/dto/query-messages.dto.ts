import { IsOptional, IsUUID } from 'class-validator';

export class QueryMessagesDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;
}
