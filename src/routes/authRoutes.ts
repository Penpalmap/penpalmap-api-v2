import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

// router.post("/login/credentials", AuthController.loginUserWithCredentials);

router.post("/forgot-password", AuthController.forgotPassword);

router.get("/verify-token-password", AuthController.verifyTokenPassword);

router.post("/reset-password", AuthController.resetPassword);

router.post("/login", AuthController.loginUser);

router.post("/register", AuthController.registerUser);

router.post("/login/google", AuthController.loginUserWithGoogle);

router.post("/refresh-token", AuthController.refreshToken);

export default router;
