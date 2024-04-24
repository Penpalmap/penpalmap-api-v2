import { Injectable, Logger } from '@nestjs/common';
import { EmailContact, SendEmailDto } from './dto/send-email.dto';
import mailjet, { Client } from 'node-mailjet';

@Injectable()
export class MailjetService {
  private readonly client: Client;
  private readonly logger = new Logger(MailjetService.name);

  constructor() {
    if (process.env.NODE_ENV != 'production') {
      this.logger.debug('In development mode, emails will appear in logs.');
      return;
    }

    this.client = mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC ?? 'public-key',
      process.env.MJ_APIKEY_PRIVATE ?? 'private-key',
      {
        config: {
          version: 'v3.1',
        },
        options: {},
      },
    );
  }

  public async sendEmail(dto: SendEmailDto): Promise<void> {
    if (process.env.NODE_ENV != 'production') {
      this.logger.debug('Sending email in development mode');
      this.logger.debug(dto);
      return Promise.resolve();
    }

    const createContact = (
      contact: EmailContact,
    ): {
      Email: string;
      Name?: string;
    } => {
      return {
        Email: typeof contact === 'string' ? contact : contact.email,
        Name: typeof contact === 'string' ? undefined : contact.name,
      };
    };

    const from = dto.from
      ? createContact(dto.from)
      : {
          Email: 'contact@meetmapper.com',
          Name: 'Meetmapper',
        };
    const to = Array.isArray(dto.to)
      ? dto.to.map(createContact)
      : [createContact(dto.to)];

    await this.client.post('send').request({
      Messages: [
        {
          From: from,
          To: to,
          Subject: dto.subject,
          TextPart: dto.text,
          HTMLPart: dto.html,
          CustomID: 'AppGettingStartedTest',
        },
      ],
    });
  }
}
