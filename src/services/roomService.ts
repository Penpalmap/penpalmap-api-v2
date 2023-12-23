import { Message } from "../../sequelize/models/Message";
import { Room } from "../../sequelize/models/Room";
import { User } from "../../sequelize/models/User";
import { Op, Sequelize } from "sequelize";
import { UserRoom } from "../../sequelize/models/UserRoom";
import sequelize from "../../sequelize/sequelize";

export const roomService = {
  // Get all rooms
  async getRooms(): Promise<Room[]> {
    return await Room.findAll();
  },

  // Get room by id
  async getRoomById(id: string): Promise<Room | null> {
    try {
      const room = await Room.findOne({
        where: {
          id: id,
        },
        include: [
          {
            model: User,
            as: "members",
          },
          {
            model: Message,
            as: "messages",

            order: [["createdAt", "DESC"]],
            limit: 1,
          },
        ],
        // attributes: {
        //   include: [
        //     [
        //       sequelize.literal(
        //         `(SELECT COUNT(*) FROM "Messages" WHERE "Messages"."roomId" = "rooms"."id" AND "Messages"."isSeen" = false AND "Messages"."senderId" != '${id}')`
        //       ),
        //       "countUnreadMessages",
        //     ],
        //   ],
        // },
      });
      console.log("room", room);

      return room;
    } catch (error) {
      console.log("error", error);
    }
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
            // {
            //   model: Message,
            //   as: "messages",
            // },
          ],
        });
      }

      return null;
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

  async getMessagesByRoomId(
    roomId: string,
    limit: string = "10",
    offset: string = "0",
    sort: string = "desc"
  ): Promise<Message[]> {
    console.log("limit", limit);
    return await Message.findAll({
      where: {
        roomId: roomId,
      },
      order: [["createdAt", sort]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  },
};
