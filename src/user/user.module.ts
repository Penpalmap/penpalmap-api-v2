import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import User from './user.model';
import UserLanguage from './user-language.model';
import UserImage from './user-image.model';
import { MinioModule } from '../minio/minio.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserLanguage, UserImage]),
    MinioModule,
    RoleModule,
  ],
  exports: [UserService],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
