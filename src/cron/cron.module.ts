import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CronService } from './cron.service'; // Path might change based on your structure
import { MailjetModule } from '../mailjet/mailjet.module'; // Adjust the import according to your structure
import Message from '../message/message.model'; // Ensure you import the correct Message model

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([Message]),
    MailjetModule,
  ],
  providers: [CronService],
})
export class CronJobModule {}
