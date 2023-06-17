import { Router } from "express";
import { MessageController } from "../controllers/messageController";

const router = Router();

// POST /api/users
router.post("/", MessageController.createMessage);

export default router;
