import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

router.post("/login/credentials", AuthController.loginUserWithCredentials);

router.post("/forgot-password", AuthController.forgotPassword);

router.get("/verify-token-password", AuthController.verifyTokenPassword);

router.post("/reset-password", AuthController.resetPassword);

export default router;
