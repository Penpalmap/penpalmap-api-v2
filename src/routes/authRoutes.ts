import { Router } from "express";
import { AuthController } from "../controllers/authController";

const router = Router();

router.post("/login/credentials", AuthController.loginUserWithCredentials);

router.post("/login/google", AuthController.loginUserWithGoogle);

export default router;
