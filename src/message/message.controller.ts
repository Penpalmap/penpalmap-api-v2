import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { MessageDto } from './dto/message.dto';
import { AuthGuard } from '@nestjs/passport';
import { PageDto } from '../shared/pagination/page.dto';
import { LoggedUser } from '../auth/logged-user.decorator';
import User from '../user/user.model';

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(201)
  public async createMessage(
    @LoggedUser() loggedUser: User,
    @Body() body: CreateMessageDto,
  ): Promise<MessageDto> {
    return await this.messageService.createMessage(loggedUser, body);
  }

  @Get()
  public async getMessages(
    @LoggedUser() loggedUser: User,
    @Query() query: QueryMessagesDto,
  ): Promise<PageDto<MessageDto>> {
    return await this.messageService.getMessages(loggedUser, query);
  }

  @Get(':id')
  public async getMessage(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<MessageDto> {
    return await this.messageService.getMessageById(loggedUser, id);
  }

  @Patch(':id')
  public async updateMessage(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: UpdateMessageDto,
  ): Promise<MessageDto> {
    return await this.messageService.updateMessage(loggedUser, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteMessage(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.messageService.deleteMessage(loggedUser, id);
  }
}
