import { Message } from "../../sequelize/models/Message";
import { Room } from "../../sequelize/models/Room";
import { User } from "../../sequelize/models/User";
import { Op } from "sequelize";

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

  // Get room by users
  async getRoomByUsers(userId1: string, userId2: string): Promise<Room | null> {
    const rooms = await Room.findOne({
      include: [
        {
          model: User,
          where: {
            id: {
              [Op.in]: [userId1, userId2],
            },
          },
        },
        {
          model: Message,
        },
      ],
    });

    return rooms;
  },
};
