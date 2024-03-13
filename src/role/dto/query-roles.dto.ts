import { Transform } from 'class-transformer';
import { IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';

export class QueryRolesDto extends PaginatedQueryDto {
  @IsOptional()
  @IsString()
  @Length(1, 65535)
  name?: string;

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
