import { Length } from 'class-validator';

export class CreateUserLanguageDto {
  @Length(1, 65535)
  language: string;

  @Length(1, 65535)
  level: string;
}
