import { Request, Response } from "express";
import { authService } from "../services/authService";

export const AuthController = {
  // Login user with Credentials
  async loginUserWithCredentials(req: Request, res: Response) {
    try {
      const user = await authService.loginUserWithCredentials(req.body);
      res.json({ success: true, user: user });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

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
};
