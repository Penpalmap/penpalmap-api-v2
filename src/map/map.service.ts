import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { UserDto } from '../user/dto/user.dto';

@Injectable()
export class MapService {
  constructor(private readonly userService: UserService) {}

  async getUsers(): Promise<UserDto[]> {
    return await this.userService.getUsersInMap();
  }
}
