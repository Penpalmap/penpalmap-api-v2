import { IsJWT, Length } from 'class-validator';

export class ResetPasswordDto {
  @IsJWT()
  token: string;

  @Length(8, 32)
  password: string;
}
