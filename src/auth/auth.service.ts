import {
  BadGatewayException,
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { PasswordLoginDto } from './dto/password-login.dto';
import { TokenSetDto } from './dto/token-set.dto';
import { UserService } from '../user/user.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { InjectRepository } from '@nestjs/typeorm';
import ResetPassword from './reset-password.model';
import { Repository } from 'typeorm';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import User from '../user/user.model';
import { JwtService } from '@nestjs/jwt';
import RefreshToken from './refresh-token.model';
import { OAuth2Client } from 'google-auth-library';
import { MailjetService } from '../mailjet/mailjet.service';
import { RoleService } from '../role/role.service';
import { LoggedInEventDto } from './dto/logged-in-event.dto';
import { Socket } from 'socket.io';
import { onlineUsers } from '../global';
import { JwtPayloadDto } from './dto/jwt-payload.dto';
import { LoggedOutEventDto } from './dto/logged-out-event.dto';
import { SocketErrorDto } from '../shared/socket/socket-error.dto';

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(ResetPassword)
    private readonly resetPasswordRepository: Repository<ResetPassword>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailjetService: MailjetService,
    private readonly roleService: RoleService,
  ) {
    this.googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
    );
  }

  async passwordLogin(dto: PasswordLoginDto): Promise<TokenSetDto> {
    const user = await this.userService.getUserByLoginRaw(dto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    if (!user?.password) {
      throw new BadRequestException('Cannot login with password');
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new ForbiddenException('Incorrect credentials');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await this.userService.incrementUserConnection(user.id);

    await this.storeRefreshTokenInDB(user, refreshToken);
    return { accessToken, refreshToken };
  }

  async forgotPassword(dto: ForgotPasswordDto): Promise<void> {
    const user = await this.userService.getUserByLoginRaw(dto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    await this.resetPasswordRepository.save({
      userId: user.id,
      token: resetToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
      user,
    });

    const urlToResetPassword = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

    await this.mailjetService.sendEmail({
      to: {
        email: user.email,
        name: user.name,
      },
      subject: 'Réinitialisation de votre mot de passe',
      text: `Bonjour ${user.name},\n\nVous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.\n\n${urlToResetPassword}`,
      html: `<h3>Bonjour ${user.name},</h3><p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.</p><p><a href=${urlToResetPassword}>Réinitialiser mon mot de passe</a></p>`,
    });
  }

  async verifyTokenPassword(dto: VerifyTokenDto): Promise<void> {
    const resetToken = await this.resetPasswordRepository.findOne({
      where: { token: dto.token },
    });

    if (!resetToken) {
      throw new ForbiddenException('Token not found');
    }
    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Token expired');
    }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const resetToken = await this.resetPasswordRepository.findOne({
      where: { token: dto.token },
      relations: {
        user: true,
      },
    });

    if (!resetToken?.user) {
      throw new ForbiddenException('Token not found');
    }
    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException('Token expired');
    }

    await this.userService.updatePasswordRaw(resetToken.user.id, dto.password);
    await this.resetPasswordRepository.remove(resetToken);
  }

  async register(payload: RegisterDto): Promise<TokenSetDto> {
    if (payload.password !== payload.passwordConfirmation) {
      throw new BadRequestException('Passwords do not match');
    }

    const userRole = await this.roleService.getRoleByNameRaw(
      RoleService.USER_ROLE_NAME,
    );
    if (!userRole) {
      throw new InternalServerErrorException(
        'User role not found. Please contact the administrator',
      );
    }

    const userCreated = await this.userService.createUserRaw({
      name: payload.name,
      email: payload.email,
      password: payload.password,
      roleIds: [userRole.id],
    });

    const accessToken = this.generateAccessToken(userCreated);
    const refreshToken = this.generateRefreshToken(userCreated);

    await this.storeRefreshTokenInDB(userCreated, refreshToken);
    return { accessToken, refreshToken };
  }

  async googleLogin(dto: GoogleLoginDto): Promise<TokenSetDto> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new BadRequestException('Invalid token');
    }

    // if the user exists
    const user = await this.userService.getUserByLoginRaw(
      payload.email,
      payload.sub,
    );

    if (user) {
      const token = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);
      await this.storeRefreshTokenInDB(user, refreshToken);

      await this.userService.incrementUserConnection(user.id);

      return { accessToken: token, refreshToken: refreshToken };
    }

    const firstname = payload.name?.split(' ')[0];

    if (!firstname) {
      throw new BadGatewayException('Error getting firstname');
    }
    if (!payload.email) {
      throw new BadGatewayException('Error getting email');
    }

    const userRole = await this.roleService.getRoleByNameRaw(
      RoleService.USER_ROLE_NAME,
    );
    if (!userRole) {
      throw new InternalServerErrorException(
        'User role not found. Please contact the administrator',
      );
    }

    const newUser = await this.userService.createUserRaw({
      name: firstname,
      email: payload.email,
      googleId: payload.sub,
      roleIds: [userRole.id],
    });

    const accessToken = this.generateAccessToken(newUser);
    const refreshToken = this.generateRefreshToken(newUser);

    await this.storeRefreshTokenInDB(newUser, refreshToken);
    return { accessToken, refreshToken };
  }

  async refreshToken(dto: RefreshTokenDto): Promise<TokenSetDto> {
    if (!dto.refreshToken) {
      throw new BadRequestException('Invalid refreshToken');
    }

    try {
      this.jwtService.verify(dto.refreshToken, {
        secret: process.env.REFRESH_TOKEN_SECRET ?? 'secret',
      });
    } catch (error) {
      throw new ForbiddenException('Invalid refreshToken');
    }

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: dto.refreshToken },
      relations: {
        user: true,
      },
    });

    if (!storedToken?.user) {
      throw new InternalServerErrorException('No user found for refreshToken');
    }

    const accessToken = this.generateAccessToken(storedToken.user);
    const refreshToken = this.generateRefreshToken(storedToken.user);

    await Promise.all([
      this.deleteRefreshTokenInDB(dto.refreshToken),
      this.storeRefreshTokenInDB(storedToken.user, refreshToken),
    ]);
    return { accessToken, refreshToken };
  }

  async loginSocketUser(client: Socket, dto: LoggedInEventDto): Promise<void> {
    try {
      this.jwtService.verify(dto.accessToken, {
        secret: process.env.ACCESS_TOKEN_SECRET ?? 'secret',
      });
      const decodedJwt = this.jwtService.decode<JwtPayloadDto>(dto.accessToken);
      onlineUsers.set(decodedJwt.userId, client.id);
      this.logger.debug(
        `User ${decodedJwt.userId} logged in (client: ${client.id})`,
      );
    } catch (error) {
      throw new UnauthorizedException(
        new SocketErrorDto(dto.eventId, 'Invalid accessToken'),
      );
    }
  }

  async logoutSocketUser(
    client: Socket,
    dto?: LoggedOutEventDto,
  ): Promise<void> {
    if (dto) {
      if (!onlineUsers.has(dto.userId)) {
        throw new NotFoundException(
          new SocketErrorDto(dto.eventId, 'User not found'),
        );
      }
      if (onlineUsers.get(dto.userId) !== client.id) {
        throw new ForbiddenException(
          new SocketErrorDto(dto.eventId, 'Invalid client'),
        );
      }
      onlineUsers.delete(dto.userId);
      this.logger.debug(`User ${dto.userId} logged out (client: ${client.id})`);
    } else {
      const userIds = Array.from(onlineUsers.entries())
        .filter(([_, value]) => value === client.id)
        .map(([userId, _]) => userId);
      userIds.forEach((userId) => onlineUsers.delete(userId));
      this.logger.debug(`User(s) ${userIds} logged out (client: ${client.id})`);
    }
  }

  private async storeRefreshTokenInDB(
    user: User,
    refreshToken: string,
  ): Promise<void> {
    await this.refreshTokenRepository.save({ user, token: refreshToken });
  }

  private async deleteRefreshTokenInDB(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.delete({ token: refreshToken });
  }

  private generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { userId: user.id },
      {
        secret: process.env.ACCESS_TOKEN_SECRET ?? 'secret',
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION ?? '365d',
      },
    );
  }

  private generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { userId: user.id },
      {
        secret: process.env.REFRESH_TOKEN_SECRET ?? 'secret',
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION ?? '7y',
      },
    );
  }
}
