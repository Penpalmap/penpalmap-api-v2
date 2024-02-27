import { IsOptional, Length } from 'class-validator';

export class UpdateMessageDto {
  @IsOptional()
  @Length(1, 65535)
  content?: string;
}
