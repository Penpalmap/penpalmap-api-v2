import { IsPositive } from 'class-validator';
import { MemoryFile } from '../../shared/memory-file.dto';

export class UploadImageDto {
  @IsPositive()
  position: number;
  image: MemoryFile;
}
