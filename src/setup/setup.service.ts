import { Injectable } from '@nestjs/common';
import { RoleService } from '../role/role.service';

@Injectable()
export class SetupService {
  constructor(private readonly roleService: RoleService) {
    this.setup();
  }

  async setup(): Promise<void> {
    await this.roleService.setup();
  }
}
