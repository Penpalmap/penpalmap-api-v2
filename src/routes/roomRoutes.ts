import { Router } from "express";
import { RoomController } from "../controllers/roomController";

const router = Router();

// GET /api/rooms
router.get("/", RoomController.getRooms);

// GET /api/rooms/:id
router.get("/:id", RoomController.getRoomById);

// GET /api/rooms/:userId1/:userId2
router.get("/:userId1/:userId2", RoomController.getRoomByUsers);

// POST /api/rooms
router.post("/", RoomController.createRoom);

// PUT /api/rooms/:id
router.put("/:id", RoomController.updateRoom);

export default router;
