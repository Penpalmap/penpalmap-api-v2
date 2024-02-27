import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyTokenDto } from './dto/verify-token.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordLoginDto } from './dto/password-login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokenSetDto } from './dto/token-set.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('forgot-password')
  @HttpCode(204)
  public async forgotPassword(@Body() body: ForgotPasswordDto): Promise<void> {
    await this.authService.forgotPassword(body);
  }

  @Get('verify-token-password')
  @HttpCode(204)
  public async verifyTokenPassword(
    @Query() query: VerifyTokenDto,
  ): Promise<void> {
    await this.authService.verifyTokenPassword(query);
  }

  @Post('reset-password')
  @HttpCode(204)
  public async resetPassword(@Body() body: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(body);
  }

  @Post('login')
  public async login(@Body() body: PasswordLoginDto): Promise<TokenSetDto> {
    return await this.authService.passwordLogin(body);
  }

  @Post('register')
  public async register(@Body() body: RegisterDto): Promise<TokenSetDto> {
    return await this.authService.register(body);
  }

  @Post('login/google')
  public async googleLogin(@Body() body: GoogleLoginDto): Promise<TokenSetDto> {
    return await this.authService.googleLogin(body);
  }

  @Post('refresh-token')
  public async refreshToken(
    @Body() body: RefreshTokenDto,
  ): Promise<TokenSetDto> {
    return await this.authService.refreshToken(body);
  }
}
