import { Module } from '@nestjs/common';
import { SetupService } from './setup.service';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [RoleModule],
  providers: [SetupService],
})
export class SetupModule {}
