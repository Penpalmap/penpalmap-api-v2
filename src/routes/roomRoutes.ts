import { Router } from "express";
import { RoomController } from "../controllers/roomController";

const router = Router();

// GET /api/rooms
router.get("/", RoomController.getRooms);

// GET /api/rooms/:id
router.get("/:id", RoomController.getRoomById);

// POST /api/rooms
router.post("/", RoomController.createRoom);

// PUT /api/rooms/:id
router.put("/:id", RoomController.updateRoom);

export default router;
