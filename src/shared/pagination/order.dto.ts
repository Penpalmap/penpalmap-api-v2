export interface OrderDto<T> {
  orderBy: T;
  order: 'ASC' | 'DESC';
}
