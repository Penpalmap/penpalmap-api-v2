import Message from "./message.model";
import { Repository } from "typeorm";
import { PostgresqlService } from "../postgresql/postgresql.service";
import { MessageDto } from "./dto/message.dto";
import { UserService } from "../user/user.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { RoomService } from "../room/room.service";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { NotFoundException } from "../shared/exception/http4xx.exception";
import { QueryMessagesDto } from "./dto/query-messages.dto";

export class MessageService {
  private static instance: MessageService;
  private readonly messageRepository: Repository<Message>;
  private readonly userService: UserService;
  private readonly roomService: RoomService;

  private constructor() {
    const dataSource = PostgresqlService.getInstance().getDataSource();
    this.messageRepository = dataSource.getRepository(Message);

    this.userService = UserService.getInstance();
    this.roomService = RoomService.getInstance();
  }

  static getInstance(): MessageService {
    if (!MessageService.instance) {
      MessageService.instance = new MessageService();
    }

    return MessageService.instance;
  }

  static messageToDto(message: Message): MessageDto {
    return {
      id: message.id,
      content: message.content,
      isSeen: message.isSeen,
      sender: message.sender
        ? UserService.userToDto(message.sender)
        : undefined,
    };
  }

  // Get all messages
  async getMessages(dto: QueryMessagesDto): Promise<MessageDto[]> {
    const messages = await this.messageRepository.find({
      where: { room: { id: dto.roomId } },
      relations: {
        room: true,
      },
    });
    return messages.map((message) => MessageService.messageToDto(message));
  }

  // Get message by id
  async getMessageById(id: string): Promise<MessageDto> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: {
        sender: true,
      },
    });
    if (!message) {
      throw new NotFoundException("Message not found");
    }
    return MessageService.messageToDto(message);
  }

  // Create message
  async createMessage(dto: CreateMessageDto): Promise<MessageDto> {
    const sender = await this.userService.getUserById(dto.senderId);
    const room = await this.roomService.getRoomById(dto.roomId);

    const message = await this.messageRepository.save({
      content: dto.content,
      sender,
      room,
    });
    return MessageService.messageToDto(message);
  }

  // Update message
  async updateMessage(id: string, dto: UpdateMessageDto): Promise<MessageDto> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    const updatedMessage = await this.messageRepository.save({
      ...message,
      content: dto.content,
    });
    return MessageService.messageToDto(updatedMessage);
  }

  // Delete message
  async deleteMessage(id: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
    });

    if (!message) {
      throw new NotFoundException("Message not found");
    }

    await this.messageRepository.remove(message);
  }
}
