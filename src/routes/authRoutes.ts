import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

router.post("/login/credentials", AuthController.loginUserWithCredentials);

router.post("/forgot-password", AuthController.forgotPassword);

export default router;
