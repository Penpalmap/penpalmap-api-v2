import { IsEmail, IsOptional, Length } from 'class-validator';

export class QueryUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @Length(1, 65535)
  googleId?: string;
}
