import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Room from './room.model';
import { DeepPartial, Repository } from 'typeorm';
import { UserService } from '../user/user.service';
import { RoomDto } from './dto/room.dto';
import { QueryRoomDto } from './dto/query-room.dto';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import User from '../user/user.model';
import { PageDto } from '../shared/pagination/page.dto';

@Injectable()
export class RoomService {
  constructor(
    @InjectRepository(Room) private readonly roomRepository: Repository<Room>,
    private readonly userService: UserService,
  ) {}

  static roomToDto(room: Room): RoomDto {
    return {
      id: room.id,
      members: room.members?.map(UserService.userToDto),
    };
  }

  // Get all rooms
  async getRooms(dto: QueryRoomDto): Promise<PageDto<RoomDto>> {
    if (dto.userIds) {
      const query = this.roomRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.members', 'member');
      dto.userIds.forEach((userId) => {
        query.andWhere((queryBuilder) => {
          const subQuery = queryBuilder
            .subQuery()
            .select('room_sub.id')
            .from(Room, 'room_sub')
            .leftJoin('room_sub.members', 'member_sub')
            .where('member_sub.id = :userId', { userId })
            .getQuery();
          return 'room.id IN ' + subQuery;
        });
      });
      const [rooms, total] = await query
        .skip(dto.offset)
        .take(dto.limit)
        .orderBy(`room.${dto.orderBy}`, dto.order)
        .getManyAndCount();
      const page = new PageDto<Room>(dto.limit, dto.offset, total, rooms);
      return page.map((room) => RoomService.roomToDto(room));
    }

    const rooms = await this.roomRepository.find({
      skip: dto.offset,
      take: dto.limit,
      order: {
        [dto.orderBy]: dto.order,
      },
    });
    const page = new PageDto<Room>(dto.limit, dto.offset, rooms.length, rooms);
    return page.map((room) => RoomService.roomToDto(room));
  }

  // Get room by id
  async getRoomById(id: string): Promise<RoomDto> {
    const room = await this.roomRepository.findOne({
      where: {
        id,
      },
      relations: {
        members: true,
        messages: true,
      },
      order: {
        messages: {
          createdAt: 'DESC',
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }
    return RoomService.roomToDto(room);
  }

  // Create room
  async createRoom(dto: CreateRoomDto): Promise<RoomDto> {
    const members = await Promise.all(
      dto.memberIds.map((userId) => this.userService.getUserById(userId)),
    );
    const room = await this.roomRepository.save({
      members,
    });
    return RoomService.roomToDto(room);
  }

  // Update room
  async updateRoom(id: string, dto: UpdateRoomDto): Promise<RoomDto> {
    const room = await this.roomRepository.findOne({
      where: {
        id,
      },
      relations: {
        members: true,
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const updatedRoom = await this.roomRepository.save({
      ...room,
      members: dto.memberIds
        ? dto.memberIds.map<DeepPartial<User>>((userId) => ({
            id: userId,
          }))
        : room.members,
    });
    return RoomService.roomToDto(updatedRoom);
  }
}
