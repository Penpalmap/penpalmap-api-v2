import { IsString, Length } from 'class-validator';

export class UpdatePasswordDto {
  @IsString()
  oldPassword: string;

  @Length(8, 32)
  newPassword: string;
}
