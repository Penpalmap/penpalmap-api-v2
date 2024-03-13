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
import { AuthGuard } from '@nestjs/passport';
import { RoleService } from './role.service';
import { QueryRolesDto } from './dto/query-roles.dto';
import { PageDto } from '../shared/pagination/page.dto';
import { RoleDto } from './dto/role.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { LoggedUser } from '../auth/logged-user.decorator';
import User from '../user/user.model';

@Controller('roles')
@UseGuards(AuthGuard('jwt'))
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  async getRoles(
    @LoggedUser() loggedUser: User,
    @Query() query: QueryRolesDto,
  ): Promise<PageDto<RoleDto>> {
    return await this.roleService.getRoles(loggedUser, query);
  }

  @Get('/:id')
  async getRoleById(@Param('id') id: string): Promise<RoleDto> {
    return await this.roleService.getRoleById(id);
  }

  @Post()
  @HttpCode(201)
  async createRole(
    @LoggedUser() loggedUser: User,
    @Body() body: CreateRoleDto,
  ): Promise<RoleDto> {
    return await this.roleService.createRole(loggedUser, body);
  }

  @Patch('/:id')
  async updateRole(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
    @Body() body: UpdateRoleDto,
  ): Promise<RoleDto> {
    return await this.roleService.updateRole(loggedUser, id, body);
  }

  @Delete('/:id')
  @HttpCode(204)
  async deleteRole(
    @LoggedUser() loggedUser: User,
    @Param('id') id: string,
  ): Promise<void> {
    await this.roleService.deleteRole(loggedUser, id);
  }
}
