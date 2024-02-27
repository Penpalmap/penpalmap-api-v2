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

@Controller('messages')
@UseGuards(AuthGuard('jwt'))
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  @HttpCode(201)
  public async createMessage(
    @Body() body: CreateMessageDto,
  ): Promise<MessageDto> {
    return await this.messageService.createMessage(body);
  }

  @Get()
  public async getMessages(
    @Query() query: QueryMessagesDto,
  ): Promise<MessageDto[]> {
    return await this.messageService.getMessages(query);
  }

  @Get(':id')
  public async getMessage(@Param('id') id: string): Promise<MessageDto> {
    return await this.messageService.getMessageById(id);
  }

  @Patch(':id')
  public async updateMessage(
    @Param('id') id: string,
    @Body() body: UpdateMessageDto,
  ): Promise<MessageDto> {
    return await this.messageService.updateMessage(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteMessage(@Param('id') id: string): Promise<void> {
    await this.messageService.deleteMessage(id);
  }
}
