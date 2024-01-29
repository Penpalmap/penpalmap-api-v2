import { Router } from "express";
import { RoomController } from "./room.controller";

const router = Router();

// GET /api/rooms
router.get("/", RoomController.getRooms);

// GET /api/rooms/:id
router.get("/:id", RoomController.getRoomById);

// GET /api/rooms/:id/messages
router.get("/:id/messages", RoomController.getMessagesByRoomId);

// POST /api/rooms
router.post("/", RoomController.createRoom);

// PUT /api/rooms/:id
router.put("/:id", RoomController.updateRoom);

router.put(
  "/:id/messages/users/:userId/read",
  RoomController.updateMessageIsRead
);

// GET /api/rooms/:userId1/:userId2
router.get("/:userId1/:userId2", RoomController.getRoomByUsers);

export default router;
