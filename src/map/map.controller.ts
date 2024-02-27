import { Controller, Get, UseGuards } from '@nestjs/common';
import { MapService } from './map.service';
import { UserDto } from '../user/dto/user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('map')
@UseGuards(AuthGuard('jwt'))
export class MapController {
  constructor(private readonly mapService: MapService) {}

  @Get('users')
  public async getUsers(): Promise<UserDto[]> {
    return await this.mapService.getUsers();
  }
}
