import { Length } from 'class-validator';

export class CreateRoleDto {
  @Length(1, 65535)
  name: string;
}
