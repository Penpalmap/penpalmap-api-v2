import {
  IsDateString,
  IsEmail,
  IsObject,
  IsOptional,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateUserLanguageDto } from './create-user-language.dto';

export class CreateUserDto {
  @IsOptional()
  @Length(1, 65535)
  bio?: string;

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsEmail()
  email: string;

  @IsOptional()
  @Length(1, 65535)
  gender?: string;

  @IsOptional()
  @Length(1, 65535)
  googleId?: string;

  @IsOptional()
  @Length(1, 65535)
  languageUsed?: string;

  @Length(1, 65535)
  name: string;

  @IsOptional()
  @Length(8, 32)
  password?: string;

  @IsOptional()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  userLanguages?: CreateUserLanguageDto[];
}
