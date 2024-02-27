import {
  Body,
  Controller,
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

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  @HttpCode(201)
  public async createRoom(@Body() body: CreateRoomDto): Promise<RoomDto> {
    return await this.roomService.createRoom(body);
  }

  @Get()
  public async getRooms(@Query() query: QueryRoomDto): Promise<RoomDto[]> {
    return await this.roomService.getRooms(query);
  }

  @Get(':id')
  public async getRoom(@Param('id') id: string): Promise<RoomDto> {
    return await this.roomService.getRoomById(id);
  }

  @Patch(':id')
  public async updateRoom(
    @Param('id') id: string,
    @Body() body: UpdateRoomDto,
  ): Promise<RoomDto> {
    return await this.roomService.updateRoom(id, body);
  }
}
