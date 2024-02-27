import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user/user.service';
import User from '../user/user.model';
import { JwtPayloadDto } from './dto/jwt-payload.dto';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly userService: UserService) {
    super({
      secretOrKey: process.env.ACCESS_TOKEN_SECRET ?? 'secret',
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayloadDto): Promise<User> {
    try {
      return await this.userService.getUserByIdRaw(payload.userId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException();
      }
      throw error;
    }
  }
}
