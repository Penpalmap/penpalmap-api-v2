import { MemoryFile } from "../../shared/memory-file.dto";

export type UploadImageDto = {
  position: number;
  image: MemoryFile;
};
