import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Message from './message.model';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { UserService } from '../user/user.service';
import { RoomService } from '../room/room.service';
import { MessageDto } from './dto/message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { PageDto } from '../shared/pagination/page.dto';
import User from '../user/user.model';
import { isAdmin } from '../shared/authorization.utils';
import { SocketService } from '../socket/socket.service';
import {
  MESSAGE_SENT_EVENT,
  MessageSentEventDto,
} from './dto/message-sent-event.dto';
import {
  MESSAGE_SEEN_EVENT,
  MessageSeenEventDto,
} from './dto/message-seen-event.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly userService: UserService,
    private readonly roomService: RoomService,
    private readonly socketService: SocketService,
  ) {}

  static messageToDto(message: Message): MessageDto {
    return {
      id: message.id,
      content: message.content,
      isSeen: message.isSeen,
      sender: message.sender
        ? UserService.userToDto(message.sender)
        : undefined,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  // Get all messages
  async getMessages(
    loggedUser: User,
    dto: QueryMessagesDto,
  ): Promise<PageDto<MessageDto>> {
    const [messages, total] = await this.messageRepository.findAndCount({
      where: {
        room: { id: dto.roomId },
        sender: isAdmin(loggedUser) ? undefined : { id: loggedUser.id },
      },
      skip: dto.offset,
      take: dto.limit,
      order: {
        [dto.orderBy]: dto.order,
      },
      relations: {
        room: true,
        sender: true,
      },
    });
    const page = new PageDto(dto.limit, dto.offset, total, messages);
    return page.map((message) => MessageService.messageToDto(message));
  }

  // Get message by id
  async getMessageById(loggedUser: User, id: string): Promise<MessageDto> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: {
        sender: true,
      },
    });
    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (!isAdmin(loggedUser) && message.sender?.id !== loggedUser.id) {
      throw new ForbiddenException('You cannot access this message');
    }
    return MessageService.messageToDto(message);
  }

  // Create message
  async createMessage(
    loggedUser: User,
    dto: CreateMessageDto,
  ): Promise<MessageDto> {
    if (!isAdmin(loggedUser) && loggedUser.id !== dto.senderId) {
      throw new ForbiddenException('You cannot send a message as another user');
    }
    const sender = await this.userService.getUserById(loggedUser, dto.senderId);
    const room = await this.roomService.getRoomById(loggedUser, dto.roomId);

    const message = await this.messageRepository.save({
      content: dto.content,
      sender,
      room,
    });

    // Send event to clients
    const messageSentEvent: MessageSentEventDto = {
      eventId: uuid(),
      messageId: message.id,
    };
    const messageSentEventReceivers =
      room.members?.map((receiver) => receiver.id) ?? [];
    this.socketService.sendMessage(
      MESSAGE_SENT_EVENT,
      messageSentEvent,
      messageSentEventReceivers,
    );

    return MessageService.messageToDto(message);
  }

  // Update message
  async updateMessage(
    loggedUser: User,
    id: string,
    dto: UpdateMessageDto,
  ): Promise<MessageDto> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: {
        sender: true,
        room: {
          members: true,
        },
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (!isAdmin(loggedUser) && message.sender?.id !== loggedUser.id) {
      throw new ForbiddenException('You cannot update this message');
    }
    if (!isAdmin(loggedUser) && !dto.isSeen && message.isSeen) {
      throw new ForbiddenException('You cannot mark this message as unseen');
    }

    const updatedMessage = await this.messageRepository.save({
      ...message,
      content: dto.content,
      isSeen: dto.isSeen,
    });

    // Send event to clients
    if (dto.isSeen && !message.isSeen) {
      const messageSeenEvent: MessageSeenEventDto = {
        eventId: uuid(),
        messageId: id,
      };
      const messageSeenEventReceivers =
        message.room?.members?.map((member) => member.id) ?? [];
      this.socketService.sendMessage(
        MESSAGE_SEEN_EVENT,
        messageSeenEvent,
        messageSeenEventReceivers,
      );
    }

    return MessageService.messageToDto(updatedMessage);
  }

  // Delete message
  async deleteMessage(loggedUser: User, id: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: {
        sender: true,
      },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }
    if (!isAdmin(loggedUser) && message.sender?.id !== loggedUser.id) {
      throw new ForbiddenException('You cannot delete this message');
    }

    await this.messageRepository.remove(message);
  }
}
