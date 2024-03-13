import { IsOptional, Length } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @Length(1, 65535)
  name?: string;
}
