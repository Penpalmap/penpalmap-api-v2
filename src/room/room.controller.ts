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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { RoomDto } from './dto/room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthGuard } from '@nestjs/passport';
import { PageDto } from '../shared/pagination/page.dto';
import { LoggedUser } from '../auth/logged-user.decorator';
import User from '../user/user.model';

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @HttpCode(201)
  public async createRoom(
    @LoggedUser() loggedUser: User,
    @Body() body: CreateRoomDto,
  ): Promise<RoomDto> {
    return await this.roomService.createRoom(loggedUser, body);
  }

  @Get()
  public async getRooms(
    @LoggedUser() loggedUser: User,
    @Query() query: QueryRoomDto,
  ): Promise<PageDto<RoomDto>> {
    return await this.roomService.getRooms(loggedUser, query);
  }

  @Get(':id')
  public async getRoom(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<RoomDto> {
    return await this.roomService.getRoomById(loggedUser, id);
  }

  @Patch(':id')
  public async updateRoom(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: UpdateRoomDto,
  ): Promise<RoomDto> {
    return await this.roomService.updateRoom(loggedUser, id, body);
  }

  @Delete(':id')
  public async deleteRoom(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    return await this.roomService.deleteRoom(loggedUser, id);
  }
}
