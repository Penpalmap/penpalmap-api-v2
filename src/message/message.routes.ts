import { Router } from "express";
import { MessageController } from "./message.controller";

const router = Router();

// POST /api/users
router.post("/", MessageController.createMessage);

export default router;
