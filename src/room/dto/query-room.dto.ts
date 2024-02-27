import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';
import { Transform } from 'class-transformer';
import Room from '../room.model';
import { OrderDto } from '../../shared/pagination/order.dto';

type OrderableRoomFields = keyof Pick<Room, 'createdAt' | 'updatedAt'>;

export class QueryRoomDto
  extends PaginatedQueryDto
  implements OrderDto<OrderableRoomFields>
{
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

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  orderBy: 'createdAt' | 'updatedAt' = 'updatedAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'ASC';
}
