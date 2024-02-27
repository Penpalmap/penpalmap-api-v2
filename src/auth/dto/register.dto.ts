import { IsEmail, IsNotEmpty, Length, MaxLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MaxLength(32)
  name: string;

  @Length(8, 32)
  password: string;

  @Length(8, 32)
  passwordConfirmation: string;
}
