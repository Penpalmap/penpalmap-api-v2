import { Request, Response } from "express";
import { RoomService } from "./room.service";
import { QueryRoomDto } from "./dto/query-room.dto";
import { CreateRoomDto } from "./dto/create-room.dto";
import { UpdateRoomDto } from "./dto/update-room.dto";

export class RoomController {
  private static instance: RoomController;
  private readonly roomService: RoomService;

  private constructor() {
    this.roomService = RoomService.getInstance();
  }

  public static getInstance(): RoomController {
    if (!RoomController.instance) {
      RoomController.instance = new RoomController();
    }

    return RoomController.instance;
  }

  // Get all rooms
  getRooms = async (
    req: Request<never, never, never, QueryRoomDto, never>,
    res: Response
  ): Promise<void> => {
    const rooms = await this.roomService.getRooms(req.query);
    res.json(rooms);
  };

  // Get room by id
  getRoomById = async (
    req: Request<{ id: string }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    const room = await this.roomService.getRoomById(req.params.id);
    res.json(room);
  };

  getRoomByUsers = async (
    req: Request<
      { userId1: string; userId2: string },
      never,
      never,
      never,
      never
    >,
    res: Response
  ): Promise<void> => {
    const rooms = await this.roomService.getRooms({
      userIds: [req.params.userId1, req.params.userId2],
    });

    if (rooms.length < 1) {
      res.status(404).json({ message: "Room not found" });
    } else if (rooms.length > 1) {
      res.status(500).json({ message: "Multiple rooms found" });
    } else {
      res.json(rooms[0]);
    }
  };

  // Create room
  createRoom = async (
    req: Request<never, never, CreateRoomDto, never, never>,
    res: Response
  ): Promise<void> => {
    const room = await this.roomService.createRoom(req.body);
    res.json(room);
  };

  // Update room
  updateRoom = async (
    req: Request<{ id: string }, never, UpdateRoomDto, never, never>,
    res: Response
  ): Promise<void> => {
    await this.roomService.updateRoom(req.params.id, req.body);
    res.json({ message: "Room updated successfully" });
  };
}
