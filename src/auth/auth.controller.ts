import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { PasswordLoginDto } from "./dto/password-login.dto";
import { GoogleLoginDto } from "./dto/google-login.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { VerifyTokenDto } from "./dto/verify-token.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";

export class AuthController {
  private static instance: AuthController;
  private readonly authService: AuthService;

  private constructor() {
    this.authService = AuthService.getInstance();
  }

  static getInstance(): AuthController {
    if (!AuthController.instance) {
      AuthController.instance = new AuthController();
    }

    return AuthController.instance;
  }

  forgotPassword = async (
    req: Request<never, never, ForgotPasswordDto, never, never>,
    res: Response
  ) => {
    await this.authService.forgotPassword(req.body);
    res.sendStatus(204);
  };

  verifyTokenPassword = async (
    req: Request<never, never, never, VerifyTokenDto, never>,
    res: Response
  ) => {
    const response = await this.authService.verifyTokenResetPassword(req.query);
    res.json(response);
  };

  resetPassword = async (
    req: Request<never, never, ResetPasswordDto, never, never>,
    res: Response
  ) => {
    const response = await this.authService.resetPassword(req.body);
    res.json(response);
  };

  passwordLogin = async (
    req: Request<never, never, PasswordLoginDto, never, never>,
    res: Response
  ) => {
    const resultToken = await this.authService.passwordLogin(req.body);
    res.json({
      success: true,
      accessToken: resultToken.accessToken,
      refreshToken: resultToken.refreshToken,
    });
  };

  registerUser = async (
    req: Request<never, never, RegisterDto, never, never>,
    res: Response
  ) => {
    const resultToken = await this.authService.registerUser(req.body);
    res.json({
      success: true,
      accessToken: resultToken.accessToken,
      refreshToken: resultToken.refreshToken,
    });
  };

  googleLogin = async (
    req: Request<never, never, GoogleLoginDto, never, never>,
    res: Response
  ) => {
    const resultToken = await this.authService.googleLogin(req.body);
    res.json({
      success: true,
      accessToken: resultToken.accessToken,
      refreshToken: resultToken.refreshToken,
    });
  };

  refreshToken = async (
    req: Request<never, never, RefreshTokenDto, never, never>,
    res: Response
  ) => {
    const token = await this.authService.refreshToken(req.body);
    res.json({ success: true, accessToken: token });
  };
}
