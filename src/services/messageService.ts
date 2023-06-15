import { Message } from "../../sequelize/models/Message";

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
  async createMessage(message: Message): Promise<Message> {
    return await Message.create(message);
  },
  // Update message
  async updateMessage(id: string, message: Message): Promise<void> {
    await Message.update(message, { where: { id } });
  },
};
