import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Message from './message.model';
import { Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { MessageDto } from './dto/message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PageDto } from '../shared/pagination/page.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
  ) {}

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
  async getMessages(dto: QueryMessagesDto): Promise<PageDto<MessageDto>> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: { room: { id: dto.roomId } },
      skip: dto.offset,
      take: dto.limit,
      order: {
        [dto.orderBy]: dto.order,
      },
      relations: {
        room: true,
      },
    });
    const page = new PageDto(dto.limit, dto.offset, total, messages);
    return page.map((message) => MessageService.messageToDto(message));
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
      throw new NotFoundException('Message not found');
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
      throw new NotFoundException('Message not found');
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
      throw new NotFoundException('Message not found');
    }

    await this.messageRepository.remove(message);
  }
}
