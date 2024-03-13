import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { isAdmin } from '../shared/authorization.utils';

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
  async getRooms(
    loggedUser: User,
    dto: QueryRoomDto,
  ): Promise<PageDto<RoomDto>> {
    const generateDto = (page: PageDto<Room>): PageDto<RoomDto> =>
      page.map((room) =>
        RoomService.roomToDto({ ...room, members: undefined }),
      );

    if (dto.userIds) {
      if (
        !isAdmin(loggedUser) &&
        dto.userIds.filter((id) => id !== loggedUser.id).length > 0
      ) {
        throw new ForbiddenException('You cannot read these rooms');
      }

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
      return generateDto(page);
    }

    const rooms = await this.roomRepository.find({
      where: {
        members: isAdmin(loggedUser) ? undefined : { id: loggedUser.id },
      },
      skip: dto.offset,
      take: dto.limit,
      order: {
        [dto.orderBy]: dto.order,
      },
      relations: {
        members: true,
      },
    });
    const page = new PageDto<Room>(dto.limit, dto.offset, rooms.length, rooms);
    return generateDto(page);
  }

  // Get room by id
  async getRoomById(loggedUser: User, id: string): Promise<RoomDto> {
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
    if (
      !isAdmin(loggedUser) &&
      !room.members?.some((member) => member.id === loggedUser.id)
    ) {
      throw new ForbiddenException('You cannot read this room');
    }
    return RoomService.roomToDto(room);
  }

  // Create room
  async createRoom(loggedUser: User, dto: CreateRoomDto): Promise<RoomDto> {
    if (!isAdmin(loggedUser) && !dto.memberIds.includes(loggedUser.id)) {
      throw new ForbiddenException('You can only create rooms with yourself');
    }
    const members = await Promise.all(
      dto.memberIds.map((userId) =>
        this.userService.getUserById(loggedUser, userId),
      ),
    );
    const room = await this.roomRepository.save({
      members,
    });
    return RoomService.roomToDto(room);
  }

  // Update room
  async updateRoom(
    loggedUser: User,
    id: string,
    dto: UpdateRoomDto,
  ): Promise<RoomDto> {
    if (!isAdmin(loggedUser) && !dto.memberIds?.includes(loggedUser.id)) {
      throw new ForbiddenException('You are removing yourself from the room');
    }
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
    if (
      !isAdmin(loggedUser) &&
      !room.members?.some((member) => member.id === loggedUser.id)
    ) {
      throw new ForbiddenException('You cannot update this room');
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

  // Delete room
  async deleteRoom(loggedUser: User, id: string): Promise<void> {
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
    if (
      !isAdmin(loggedUser) &&
      !room.members?.some((member) => member.id === loggedUser.id)
    ) {
      throw new ForbiddenException('You cannot delete this room');
    }

    await this.roomRepository.remove(room);
  }
}
