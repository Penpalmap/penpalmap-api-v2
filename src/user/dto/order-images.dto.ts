import { IsPositive } from 'class-validator';

export class OrderImagesDto {
  @IsPositive({ each: true })
  order: number[];
}
