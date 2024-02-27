import { Module } from '@nestjs/common';
import { MinioService } from './minio.service';

@Module({
  imports: [],
  controllers: [],
  providers: [MinioService],
  exports: [MinioService],
})
export class MinioModule {}
