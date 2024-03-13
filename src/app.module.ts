import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { RoomModule } from './room/room.module';
import { MessageModule } from './message/message.module';
import { MapModule } from './map/map.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { JwtModule } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { MailjetModule } from './mailjet/mailjet.module';
import { AppController } from './app.controller';
import { MinioModule } from './minio/minio.module';
import { SocketGateway } from './socket/socket.gateway';
import { SocketService } from './socket/socket.service';
import { SocketModule } from './socket/socket.module';
import { RoleModule } from './role/role.module';
import { SetupModule } from './setup/setup.module';

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

        return addTransactionalDataSource(new DataSource(options));
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
    SocketModule,
    RoleModule,
    SetupModule,
  ],
  controllers: [AppController],
  providers: [SocketGateway, SocketService],
})
export class AppModule {}
