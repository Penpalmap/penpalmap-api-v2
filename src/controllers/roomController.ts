import { Request, Response } from "express";
import { roomService } from "../services/roomService";

export const RoomController = {
  // Get all rooms
  async getRooms(req: Request, res: Response): Promise<void> {
    try {
      const rooms = await roomService.getRooms();
      res.json(rooms);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Get room by id
  async getRoomById(req: Request, res: Response): Promise<void> {
    try {
      const room = await roomService.getRoomById(req.params.id);
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Create room
  async createRoom(req: Request, res: Response): Promise<void> {
    try {
      console.log(req.body);
      const room = await roomService.createRoom(req.body);
      res.json(room);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Update room
  async updateRoom(req: Request, res: Response): Promise<void> {
    try {
      await roomService.updateRoom(req.params.id, req.body);
      res.json({ message: "Room updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
