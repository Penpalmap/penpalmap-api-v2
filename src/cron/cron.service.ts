import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import Message from '../message/message.model';
import { MailjetService } from '../mailjet/mailjet.service';
import { SendEmailDto } from '../mailjet/dto/send-email.dto';

@Injectable()
export class CronService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
    private mailjetService: MailjetService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron(): Promise<void> {
    console.log('Running cron job...');
    const oneHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);

    const messages = await this.messageRepository.find({
      where: {
        createdAt: LessThan(oneHourAgo),
        isSeen: false,
        notificationSent: false,
      },
      relations: ['room', 'room.members', 'sender'],
    });
    const rooms = new Set(messages.map((msg) => msg.room?.id));
    for (const roomId of rooms) {
      const roomMessages = messages.filter((msg) => msg.room?.id === roomId);
      if (roomMessages.length > 0) {
        const sendEmailDto = new SendEmailDto();
        sendEmailDto.from = {
          email: 'contact@penpalmap.com',
          name: 'Meetmapper',
        };

        for (const member of roomMessages[0].room?.members ?? []) {
          if (member.id !== roomMessages[0].sender?.id) {
            sendEmailDto.to = member.email;
            sendEmailDto.subject = 'You have unread messages';
            sendEmailDto.text = `You have ${roomMessages.length} unread messages`;
            sendEmailDto.html = `<strong>You have ${roomMessages.length} unread messages by ${roomMessages[0].sender?.name}.</strong>.`;

            await this.mailjetService.sendEmail(sendEmailDto);
          }
        }

        // Marquer les messages comme notifiés
        roomMessages.forEach((msg) => (msg.notificationSent = true));
        await this.messageRepository.save(roomMessages);
      }
    }
  }
}
