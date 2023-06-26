import { Message } from "../../sequelize/models/Message";
import { Room } from "../../sequelize/models/Room";
import { UserRoom } from "../../sequelize/models/UserRoom";
import { MessageInput } from "../../types/types";

export const messageService = {
  // Get all messages
  async getMessages(): Promise<Message[]> {
    return await Message.findAll();
  },
  // Get message by id
  async getMessageById(id: string): Promise<Message | null> {
    return await Message.findByPk(id);
  },
  // Create message
  async createMessage(message: MessageInput): Promise<Message | null> {
    let room: Room | null;

    if (!message.roomId) {
      // Si le roomId n'est pas fourni, créer une nouvelle room
      room = await Room.create();
      // Ajouter les membres à la nouvelle room
      await UserRoom.bulkCreate([
        { userId: message.senderId, roomId: room.id } as UserRoom,
        { userId: message.receiverId, roomId: room.id } as UserRoom,
      ]);
    } else {
      // Si le roomId est fourni, vérifier si la room existe
      room = await Room.findByPk(message.roomId);
      if (!room) {
        throw new Error("La room spécifiée n'existe pas");
      }
    }

    // Créer le message dans la room
    const createdMessage = await Message.create({
      content: message.content,
      room: room,
      roomId: room.id,
      senderId: message.senderId,
    } as Message);

    // return created message with room
    return await Message.findByPk(createdMessage.id, {
      include: [{ model: Room, as: "room" }],
    });
  },
  // Update message
  async updateMessage(id: string, message: Message): Promise<void> {
    await Message.update(message, { where: { id } });
  },
};
