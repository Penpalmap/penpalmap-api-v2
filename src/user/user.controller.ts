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
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UploadImageDto } from './dto/upload-image.dto';
import { MemoryFile } from '../shared/memory-file.dto';
import { OrderImagesDto } from './dto/order-images.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { PageDto } from '../shared/pagination/page.dto';
import { UserImageDto } from './dto/user-image.dto';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  public async createUser(@Body() body: CreateUserDto): Promise<UserDto> {
    return await this.userService.createUser(body);
  }

  @Get()
  public async getUsers(
    @Query() query: QueryUserDto,
  ): Promise<PageDto<UserDto>> {
    return await this.userService.getUsers(query);
  }

  @Get(':id')
  public async getUser(@Param('id') id: string): Promise<UserDto> {
    return await this.userService.getUserById(id);
  }

  @Patch(':id')
  public async updateUser(
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.userService.updateUser(id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Post(':id/images')
  // @HttpCode(204)
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: memoryStorage(),
    }),
  )
  public async uploadImage(
    @Param('id') id: string,
    @Body() body: Omit<UploadImageDto, 'image'>,
    @UploadedFile()
    image: MemoryFile,
  ): Promise<UserImageDto> {
    return await this.userService.uploadImage(id, { ...body, image });
  }

  @Delete(':id/images/:position')
  @HttpCode(204)
  public async deleteImage(
    @Param('id') id: string,
    @Param('position') position: number,
  ): Promise<void> {
    await this.userService.deleteImage(id, position);
  }

  @Post(':id/images/reorder')
  @HttpCode(204)
  public async reorderImages(
    @Param('id') id: string,
    @Body() body: OrderImagesDto,
  ): Promise<void> {
    await this.userService.reorderImages(id, body);
  }

  @Post(':id/password')
  @HttpCode(204)
  public async updateUserPassword(
    @Param('id') id: string,
    @Body() body: UpdatePasswordDto,
  ): Promise<void> {
    await this.userService.updateUserPassword(id, body);
  }
}
