import bcrypt from "bcrypt";
import User from "../user/user.model";
import crypto from "crypto";
import ResetPassword from "./reset-password.model";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import RefreshTokens from "./refresh-token.model";
import { Repository } from "typeorm";
import { PostgresqlService } from "../postgresql/postgresql.service";
import { RegisterDto } from "./dto/register.dto";
import { PasswordLoginDto } from "./dto/password-login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { UserService } from "../user/user.service";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyTokenDto } from "./dto/verify-token.dto";
import { MailjetService } from "../mailjet/mailjet.service";
import { TokenSetDto } from "./dto/token-set.dto";
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from "../shared/exception/http4xx.exception";
import {
  BadGatewayException,
  InternalServerErrorException,
} from "../shared/exception/http5xx.exception";

export class AuthService {
  private static instance: AuthService;
  private readonly refreshTokenRepository: Repository<RefreshTokens>;
  private readonly resetPasswordRepository: Repository<ResetPassword>;
  private readonly userService: UserService;
  private readonly mailjetService: MailjetService;
  private readonly googleClient: OAuth2Client;

  private constructor() {
    const dataSource = PostgresqlService.getInstance().getDataSource();

    this.refreshTokenRepository = dataSource.getRepository(RefreshTokens);
    this.resetPasswordRepository = dataSource.getRepository(ResetPassword);

    this.userService = UserService.getInstance();
    this.mailjetService = MailjetService.getInstance();
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }

    return AuthService.instance;
  }

  passwordLogin = async (dto: PasswordLoginDto): Promise<TokenSetDto> => {
    const user = await this.userService.getUserByLoginRaw(dto.email);
    if (!user?.password) {
      throw new BadRequestException("Cannot login with password");
    }

    if (!(await bcrypt.compare(dto.password, user.password))) {
      throw new ForbiddenException("Incorrect credentials");
    }

    const accessToken = AuthService.generateAccessToken(user);
    const refreshToken = AuthService.generateRefreshToken(user);

    await this.storeRefreshTokenInDB(user, refreshToken);
    return { accessToken, refreshToken };
  };

  forgotPassword = async (dto: ForgotPasswordDto): Promise<void> => {
    const user = await this.userService.getUserByLoginRaw(dto.email);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

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
      subject: "Réinitialisation de votre mot de passe",
      text: `Bonjour ${user.name},\n\nVous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.\n\n${urlToResetPassword}`,
      html: `<h3>Bonjour ${user.name},</h3><p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.</p><p><a href=${urlToResetPassword}>Réinitialiser mon mot de passe</a></p>`,
    });
  };

  verifyTokenResetPassword = async (dto: VerifyTokenDto): Promise<void> => {
    const resetToken = await this.resetPasswordRepository.findOne({
      where: { token: dto.token },
    });

    if (!resetToken) {
      throw new ForbiddenException("Token not found");
    }
    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException("Token expired");
    }
  };

  resetPassword = async (dto: ResetPasswordDto): Promise<void> => {
    const resetToken = await this.resetPasswordRepository.findOne({
      where: { token: dto.token },
      relations: {
        user: true,
      },
    });

    if (!resetToken?.user) {
      throw new ForbiddenException("Token not found");
    }
    if (resetToken.expiresAt.getTime() < Date.now()) {
      throw new ForbiddenException("Token expired");
    }

    await this.userService.updatePasswordRaw(resetToken.user.id, dto.password);
    await this.resetPasswordRepository.remove(resetToken);
  };

  registerUser = async (payload: RegisterDto): Promise<TokenSetDto> => {
    if (payload.password !== payload.passwordConfirmation) {
      throw new BadRequestException("Passwords do not match");
    }
    const userCreated = await this.userService.createUserRaw({
      name: payload.name,
      email: payload.email,
      password: payload.password,
    });

    const accessToken = AuthService.generateAccessToken(userCreated);
    const refreshToken = AuthService.generateRefreshToken(userCreated);

    await this.storeRefreshTokenInDB(userCreated, refreshToken);
    return { accessToken, refreshToken };
  };

  googleLogin = async (dto: GoogleLoginDto): Promise<TokenSetDto> => {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: dto.token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();

    if (!payload) {
      throw new BadRequestException("Invalid token");
    }

    // if the user exists
    const user = await this.userService.getUserByLoginRaw(
      payload.email,
      payload.sub
    );

    if (user) {
      const token = AuthService.generateAccessToken(user);
      const refreshToken = AuthService.generateRefreshToken(user);
      await this.storeRefreshTokenInDB(user, refreshToken);
      return { accessToken: token, refreshToken: refreshToken };
    }

    const firstname = payload.name?.split(" ")[0];

    if (!firstname) {
      throw new BadGatewayException("Error getting firstname");
    }
    if (!payload.email) {
      throw new BadGatewayException("Error getting email");
    }

    const newUser = await this.userService.createUserRaw({
      name: firstname,
      email: payload.email,
      googleId: payload.sub,
    });

    const accessToken = AuthService.generateAccessToken(newUser);
    const refreshToken = AuthService.generateRefreshToken(newUser);

    await this.storeRefreshTokenInDB(newUser, refreshToken);
    return { accessToken, refreshToken };
  };

  refreshToken = async (dto: RefreshTokenDto): Promise<TokenSetDto> => {
    if (!dto.refreshToken) {
      throw new BadRequestException("Invalid refreshToken");
    }

    try {
      jwt.verify(
        dto.refreshToken,
        process.env.REFRESH_TOKEN_SECRET ?? "secret"
      );
    } catch (error) {
      throw new ForbiddenException("Invalid refreshToken");
    }

    const storedToken = await this.refreshTokenRepository.findOne({
      where: { token: dto.refreshToken },
      relations: {
        user: true,
      },
    });

    if (!storedToken?.user) {
      throw new InternalServerErrorException("No user found for refreshToken");
    }

    const accessToken = AuthService.generateAccessToken(storedToken.user);
    const refreshToken = AuthService.generateRefreshToken(storedToken.user);

    await Promise.all([
      this.deleteRefreshTokenInDB(dto.refreshToken),
      this.storeRefreshTokenInDB(storedToken.user, refreshToken),
    ]);
    return { accessToken, refreshToken };
  };

  private storeRefreshTokenInDB = async (
    user: User,
    refreshToken: string
  ): Promise<void> => {
    await this.refreshTokenRepository.save({ user, token: refreshToken });
  };

  private deleteRefreshTokenInDB = async (
    refreshToken: string
  ): Promise<void> => {
    await this.refreshTokenRepository.delete({ token: refreshToken });
  };

  private static generateAccessToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      process.env.ACCESS_TOKEN_SECRET ?? "secret",
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRATION ?? "365d",
      }
    );
  }

  private static generateRefreshToken(user: User): string {
    return jwt.sign(
      { userId: user.id },
      process.env.REFRESH_TOKEN_SECRET ?? "secret",
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRATION ?? "7y",
      }
    );
  }
}
