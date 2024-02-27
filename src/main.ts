import { NestFactory } from '@nestjs/core';
import { initializeTransactionalContext } from 'typeorm-transactional';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  initializeTransactionalContext();

  const app = await NestFactory.create(AppModule, {
    cors: true,
    abortOnError: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.setGlobalPrefix('api', {
    exclude: ['health', 'version', 'ping'],
  });
  await app.listen(5000);
}
bootstrap();
