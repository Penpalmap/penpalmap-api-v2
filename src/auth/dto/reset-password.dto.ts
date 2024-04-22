import { Length } from 'class-validator';

export class ResetPasswordDto {
  @Length(64, 64)
  token: string;

  @Length(8, 32)
  password: string;
}
