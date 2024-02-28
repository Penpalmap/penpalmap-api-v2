import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { PaginatedQueryDto } from '../../shared/pagination/paginated-query.dto';
import Message from '../message.model';
import { OrderDto } from '../../shared/pagination/order.dto';

type OrderableMessageFields = keyof Pick<Message, 'createdAt' | 'updatedAt'>;

export class QueryMessagesDto
  extends PaginatedQueryDto
  implements OrderDto<OrderableMessageFields>
{
  @IsOptional()
  @IsUUID()
  roomId?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt'])
  orderBy: OrderableMessageFields = 'createdAt';

  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  order: 'ASC' | 'DESC' = 'ASC';
}
