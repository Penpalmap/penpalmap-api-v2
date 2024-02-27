import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import ResetPassword from './reset-password.model';
import RefreshToken from './refresh-token.model';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { MailjetModule } from '../mailjet/mailjet.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([ResetPassword, RefreshToken]),
    UserModule,
    JwtModule,
    MailjetModule,
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
