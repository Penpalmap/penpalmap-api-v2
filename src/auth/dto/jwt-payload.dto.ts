import { IsUUID } from 'class-validator';

export class JwtPayloadDto {
  @IsUUID()
  userId: string;
}
