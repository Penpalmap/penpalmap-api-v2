import { Request, Response } from "express";
import { authService } from "../services/authService";
import { cp } from "fs";

export const AuthController = {
  async forgotPassword(req: Request, res: Response) {
    try {
      const response = await authService.forgotPassword(req.body.email);
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Une erreur s'est produite..." });
    }
  },

  async verifyTokenPassword(req: Request, res: Response) {
    try {
      const { token } = req.query;

      const response = await authService.verifyTokenResetPassword(
        token as string
      );
      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Une erreur s'est produite..." });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;

      const response = await authService.resetPassword(token, password);

      res.json(response);
    } catch (error) {
      res.status(500).json({ message: "Une erreur s'est produite..." });
    }
  },

  async loginUser(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const resultToken = await authService.loginUser({ email, password });
      res.json({
        success: true,
        accessToken: resultToken.accessToken,
        refreshToken: resultToken.refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async registerUser(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body;
      const resultToken = await authService.registerUser({
        email,
        name,
        password,
      } as any);
      res.json({
        success: true,
        accessToken: resultToken.accessToken,
        refreshToken: resultToken.refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async loginUserWithGoogle(req: Request, res: Response) {
    try {
      const { token: tokenGoogle } = req.body;

      const resultToken = await authService.loginUserWithGoogle(tokenGoogle);

      res.json({
        success: true,
        accessToken: resultToken.accessToken,
        refreshToken: resultToken.refreshToken,
      });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      const token = await authService.refreshToken(refreshToken);
      res.json({ success: true, accessToken: token });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
