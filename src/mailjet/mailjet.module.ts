import { Module } from '@nestjs/common';
import { MailjetService } from './mailjet.service';

@Module({
  exports: [MailjetService],
  providers: [MailjetService],
})
export class MailjetModule {}
