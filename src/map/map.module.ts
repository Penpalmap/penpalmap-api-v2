import { Module } from '@nestjs/common';
import { MapService } from './map.service';
import { MapController } from './map.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  providers: [MapService],
  controllers: [MapController],
})
export class MapModule {}
