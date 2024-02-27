import { IsOptional, IsUUID } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';
import { Transform } from 'class-transformer';

export class QueryRoomDto extends PaginatedQueryDto {
  @IsOptional()
  @IsUUID('4', { each: true })
  @Transform(
    ({ value }: { value: string | string[] }) =>
      Array.isArray(value) ? value : [value],
    {
      toClassOnly: true,
    },
  )
  userIds?: string[];
}
