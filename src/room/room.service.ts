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
  async getRooms(dto: QueryRoomDto): Promise<RoomDto[]> {
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
      const rooms = await query.getMany();
      return rooms.map((room) => RoomService.roomToDto(room));
    }

    const rooms = await this.roomRepository.find();
    return rooms.map((room) => RoomService.roomToDto(room));
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
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    const updatedRoom = await this.roomRepository.save({
      ...room,
      members: dto.memberIds.map<DeepPartial<User>>((userId) => ({
        id: userId,
      })),
    });
    return RoomService.roomToDto(updatedRoom);
  }
}
