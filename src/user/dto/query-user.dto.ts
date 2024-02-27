import { IsEmail, IsOptional, Length } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';

export class QueryUserDto extends PaginatedQueryDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(1, 65535)
  googleId?: string;
}
