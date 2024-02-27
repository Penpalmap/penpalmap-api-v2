export type MemoryFile = Omit<
  Express.Multer.File,
  'destination' | 'filename' | 'path'
>;
