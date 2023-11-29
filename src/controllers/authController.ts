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

  // Login user with Google
  async loginUserWithGoogle(req: Request, res: Response) {
    try {
      const user = await authService.loginUserWithGoogle(req.body);
      res.json({ success: true, user: user });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
