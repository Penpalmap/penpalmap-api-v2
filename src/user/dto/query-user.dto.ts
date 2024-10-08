import {
  IsEmail,
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';
import User from '../user.model';
import { OrderDto } from '../../shared/pagination/order.dto';
import { Transform } from 'class-transformer';

type OrderableUserFields = keyof Pick<User, 'points'>;

export class QueryUserDto
  extends PaginatedQueryDto
  implements OrderDto<OrderableUserFields>
{
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(1, 65535)
  googleId?: string;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @Min(-90)
  @Max(90)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @Min(-180)
  @Max(180)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value), { toClassOnly: true })
  @IsPositive()
  radius?: number;

  @IsOptional()
  @IsIn(['points'])
  orderBy: OrderableUserFields = 'points';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'DESC';

  @IsOptional()
  @IsUUID('4', { each: true })
  @Transform(
    ({ value }: { value: string | string[] }) =>
      Array.isArray(value) ? value : [value],
    {
      toClassOnly: true,
    },
  )
  roleIds?: string[];
}
