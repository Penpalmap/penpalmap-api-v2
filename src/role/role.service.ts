import {
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Role from './role.model';
import { In, Repository } from 'typeorm';
import { RoleDto } from './dto/role.dto';
import { QueryRolesDto } from './dto/query-roles.dto';
import { PageDto } from '../shared/pagination/page.dto';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import User from '../user/user.model';
import { isAdmin } from '../shared/authorization.utils';
import { Setupable } from '../setup/setup.interface';

@Injectable()
export class RoleService implements Setupable<void> {
  static readonly ADMIN_ROLE_NAME = 'admin';
  static readonly USER_ROLE_NAME = 'user';

  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async setup(): Promise<void> {
    const adminRole = await this.roleRepository.findOne({
      where: { name: RoleService.ADMIN_ROLE_NAME },
    });
    if (!adminRole) {
      this.logger.log('Creating admin role');
      await this.roleRepository.save({ name: RoleService.ADMIN_ROLE_NAME });
    }
    const userRole = await this.roleRepository.findOne({
      where: { name: RoleService.USER_ROLE_NAME },
    });
    if (!userRole) {
      this.logger.log('Creating user role');
      await this.roleRepository.save({ name: RoleService.USER_ROLE_NAME });
    }
  }

  static roleToDto(role: Role): RoleDto {
    return {
      id: role.id,
      name: role.name,
    };
  }

  async getRoles(
    loggedUser: User,
    dto: QueryRolesDto,
  ): Promise<PageDto<RoleDto>> {
    if (!isAdmin(loggedUser)) {
      throw new ForbiddenException('You cannot read roles');
    }
    const roles = await this.roleRepository.find({
      where: {
        name: dto.name,
        users: dto.userIds
          ? {
              id: In(dto.userIds),
            }
          : undefined,
      },
      skip: dto.offset,
      take: dto.limit,
      relations: {
        users: Boolean(dto.userIds),
      },
    });
    const page = new PageDto(dto.limit, dto.offset, roles.length, roles);
    return page.map((role) =>
      RoleService.roleToDto({ ...role, users: undefined }),
    );
  }

  async getRoleById(id: string): Promise<RoleDto> {
    const role = await this.getRoleByIdRaw(id);
    return RoleService.roleToDto(role);
  }

  async getRoleByIdRaw(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async getRoleByNameRaw(name: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { name },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  async createRole(loggedUser: User, dto: CreateRoleDto): Promise<RoleDto> {
    if (!isAdmin(loggedUser)) {
      throw new ForbiddenException('You cannot create a role');
    }

    const rolesWithSameName = await this.roleRepository.find({
      where: { name: dto.name },
    });
    if (rolesWithSameName.length > 0) {
      throw new ConflictException('Role with the same name already exists');
    }
    const role = await this.roleRepository.save({ name: dto.name });
    return RoleService.roleToDto(role);
  }

  async updateRole(
    loggedUser: User,
    id: string,
    dto: UpdateRoleDto,
  ): Promise<RoleDto> {
    if (!isAdmin(loggedUser)) {
      throw new ForbiddenException('You cannot update a role');
    }
    const role = await this.roleRepository.findOne({
      where: { id },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (dto.name && dto.name !== role.name) {
      const rolesWithSameName = await this.roleRepository.find({
        where: { name: dto.name },
      });
      if (rolesWithSameName.length > 0) {
        throw new ConflictException('Role with the same name already exists');
      }
    }

    const updatedRole = await this.roleRepository.save({
      ...role,
      name: dto.name ?? role.name,
    });
    return RoleService.roleToDto(updatedRole);
  }

  async deleteRole(loggedUser: User, id: string): Promise<void> {
    if (!isAdmin(loggedUser)) {
      throw new ForbiddenException('You cannot delete this role');
    }
    const role = await this.roleRepository.findOne({
      where: { id },
      relations: { users: true },
    });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    if (role.name === 'admin') {
      throw new ForbiddenException('You cannot delete the admin role');
    }
    if (role.users && role.users.length > 0) {
      await this.roleRepository.save({ ...role, users: [] });
    }
    await this.roleRepository.remove(role);
  }
}
