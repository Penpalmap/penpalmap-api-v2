import { Room } from "../../sequelize/models/Room";

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    return await Room.findAll();
  },

  // Get room by id
  async getRoomById(id: string): Promise<Room | null> {
    return await Room.findByPk(id);
  },

  // Create room
  async createRoom(room: Room): Promise<Room> {
    return await Room.create(room);
  },

  // Update room
  async updateRoom(id: string, room: Room): Promise<void> {
    await Room.update(room, { where: { id } });
  },
};
