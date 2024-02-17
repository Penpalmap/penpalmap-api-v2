import { BaseRouter } from "../shared/base.router";
import { asyncErrorWrapper } from "../shared/async-error-wrapper";
import { AuthController } from "./auth.controller";

export class AuthRouter extends BaseRouter {
  private static instance: AuthRouter;
  private readonly authController: AuthController;

  private constructor() {
    super();
    this.authController = AuthController.getInstance();

    this.router.post(
      "/forgot-password",
      asyncErrorWrapper(this.authController.forgotPassword)
    );
    this.router.get(
      "/verify-token-password",
      asyncErrorWrapper(this.authController.verifyTokenPassword)
    );
    this.router.post(
      "/reset-password",
      asyncErrorWrapper(this.authController.resetPassword)
    );
    this.router.post(
      "/login",
      asyncErrorWrapper(this.authController.passwordLogin)
    );
    this.router.post(
      "/register",
      asyncErrorWrapper(this.authController.registerUser)
    );
    this.router.post(
      "/login/google",
      asyncErrorWrapper(this.authController.googleLogin)
    );
    this.router.post(
      "/refresh-token",
      asyncErrorWrapper(this.authController.refreshToken)
    );
  }

  public static getInstance(): AuthRouter {
    if (!AuthRouter.instance) {
      AuthRouter.instance = new AuthRouter();
    }

    return AuthRouter.instance;
  }
}
