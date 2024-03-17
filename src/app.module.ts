import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { MapModule } from './map/map.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  addTransactionalDataSource,
  getDataSourceByName,
} from 'typeorm-transactional';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { MailjetModule } from './mailjet/mailjet.module';
import { AppController } from './app.controller';
import { MinioModule } from './minio/minio.module';
import { RoleModule } from './role/role.module';
import { SetupModule } from './setup/setup.module';
import { SocketModule } from './socket/socket.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        host: process.env.DB_HOST ?? 'localhost',
        port: parseInt(process.env.DB_PORT ?? '5432') || 5432,
        username: process.env.DB_USER ?? 'postgres',
        password: process.env.DB_PASSWORD ?? 'secret',
        database: process.env.DB_NAME ?? 'postgres',
        entities: [__dirname + '/**/*.model{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production',
      }),
      async dataSourceFactory(options) {
        if (!options) {
          throw new Error('Invalid options passed');
        }

        return (
          getDataSourceByName('default') ||
          addTransactionalDataSource(new DataSource(options))
        );
      },
    }),
    MinioModule,
    JwtModule.register({
      global: true,
    }),
    UserModule,
    AuthModule,
    RoomModule,
    MessageModule,
    MapModule,
    MailjetModule,
    MinioModule,
    RoleModule,
    SetupModule,
    SocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
