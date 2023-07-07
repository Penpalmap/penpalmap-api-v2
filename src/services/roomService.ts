import { Message } from "../../sequelize/models/Message";
import { Room } from "../../sequelize/models/Room";
import { User } from "../../sequelize/models/User";
import { Op, Sequelize } from "sequelize";
import { UserRoom } from "../../sequelize/models/UserRoom";

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
    // get rooms where user1 and user2 are members
    try {
      const room = await UserRoom.findOne({
        where: {
          userId: {
            [Op.in]: [userId1, userId2],
          },
        },
        attributes: ["roomId"],
        group: ["roomId"],
        having: Sequelize.literal(`COUNT(*) = 2`),
      });

      if (room) {
        return await Room.findByPk(room.roomId, {
          include: [
            {
              model: User,
              as: "members",
            },
            {
              model: Message,
              as: "messages",
            },
          ],
        });
      }

      return room;
    } catch (error) {
      console.log(error);
      return null;
    }
  },

  async setMessagesIsReadByRoomId(
    roomId: string,
    userId: string
  ): Promise<void> {
    // update all messages in room where senderId is not userId
    await Message.update(
      { isSeen: true },
      {
        where: {
          roomId: roomId,
          senderId: {
            [Op.eq]: userId,
          },
        },
      }
    );
  },
};
