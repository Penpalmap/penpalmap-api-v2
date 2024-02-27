import { IsOptional, IsUUID } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';

export class QueryMessagesDto extends PaginatedQueryDto {
  @IsOptional()
  @IsUUID()
  roomId?: string;
}
