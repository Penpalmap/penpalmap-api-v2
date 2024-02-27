import { Type } from 'class-transformer';
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator';

export class PaginatedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  offset: number = 0;
}
