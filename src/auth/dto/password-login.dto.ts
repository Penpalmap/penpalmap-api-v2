import { IsEmail, Length } from 'class-validator';

export class PasswordLoginDto {
  @IsEmail()
  email: string;

  @Length(8, 32)
  password: string;
}
