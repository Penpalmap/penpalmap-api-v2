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
import { LoggedUser } from '../auth/logged-user.decorator';
import User from './user.model';

@Controller('users')
@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  public async createUser(
    @LoggedUser() loggedUser: User,
    @Body() body: CreateUserDto,
  ): Promise<UserDto> {
    return await this.userService.createUser(loggedUser, body);
  }

  @Get()
  public async getUsers(
    @LoggedUser() loggedUser: User,
    @Query() query: QueryUserDto,
  ): Promise<PageDto<UserDto>> {
    return await this.userService.getUsers(loggedUser, query);
  }

  @Get(':id')
  public async getUser(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<UserDto> {
    return await this.userService.getUserById(loggedUser, id);
  }

  @Patch(':id')
  public async updateUser(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: UpdateUserDto,
  ): Promise<UserDto> {
    return await this.userService.updateUser(loggedUser, id, body);
  }

  @Delete(':id')
  @HttpCode(204)
  public async deleteUser(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.userService.deleteUser(loggedUser, id);
  }

  @Post(':id/images')
  @UseInterceptors(
    FileInterceptor('profileImage', {
      storage: memoryStorage(),
    }),
  )
  public async uploadImage(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: Omit<UploadImageDto, 'image'>,
    @UploadedFile()
    image: MemoryFile,
  ): Promise<UserImageDto> {
    return await this.userService.uploadImage(loggedUser, id, {
      ...body,
      image,
    });
  }

  @Delete(':id/images/:position')
  @HttpCode(204)
  public async deleteImage(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Param('position') position: number,
  ): Promise<void> {
    await this.userService.deleteImage(loggedUser, id, position);
  }

  @Post(':id/images/reorder')
  @HttpCode(204)
  public async reorderImages(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: OrderImagesDto,
  ): Promise<void> {
    await this.userService.reorderImages(loggedUser, id, body);
  }

  @Post(':id/password')
  @HttpCode(204)
  public async updateUserPassword(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: UpdatePasswordDto,
  ): Promise<void> {
    await this.userService.updateUserPassword(loggedUser, id, body);
  }
}
