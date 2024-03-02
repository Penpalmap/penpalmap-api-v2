import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsObject,
  IsOptional,
  IsUUID,
  Length,
  ValidateNested,
} from 'class-validator';
import { CreateUserLanguageDto } from './create-user-language.dto';

export class UpdateUserDto {
  @IsOptional()
  @Length(0, 65535)
  bio?: string;

  @IsOptional()
  @IsUUID('4', { each: true })
  blockedUserIds?: string[];

  @IsOptional()
  @IsDateString()
  birthday?: Date;

  @IsOptional()
  @Length(1, 65535)
  gender?: string;

  @IsOptional()
  @Length(1, 65535)
  languageUsed?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsBoolean()
  isNewUser?: boolean;

  @IsOptional()
  @Length(1, 65535)
  name?: string;

  @IsOptional()
  @IsObject({ each: true })
  @ValidateNested({ each: true })
  userLanguages?: CreateUserLanguageDto[];
}
