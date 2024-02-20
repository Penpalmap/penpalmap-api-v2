import mailjet, { Client } from "node-mailjet";
import { EmailContact, SendEmailDto } from "./dto/send-email.dto";

export class MailjetService {
  private static instance: MailjetService;
  private readonly client: Client;

  private constructor() {
    this.client = mailjet.apiConnect(
      process.env.MJ_APIKEY_PUBLIC ?? "public-key",
      process.env.MJ_APIKEY_PRIVATE ?? "private-key",
      {
        config: {
          version: "v3.1",
        },
        options: {},
      }
    );
  }

  static getInstance(): MailjetService {
    if (!MailjetService.instance) {
      MailjetService.instance = new MailjetService();
    }

    return MailjetService.instance;
  }

  public async sendEmail(dto: SendEmailDto): Promise<void> {
    const createContact = (contact: EmailContact) => {
      return {
        Email: typeof contact === "string" ? contact : contact.email,
        Name: typeof contact === "string" ? undefined : contact.name,
      };
    };

    const from = dto.from
      ? createContact(dto.from)
      : {
          Email: "contact@penpalmap.com",
          Name: "Penpalmap",
        };
    const to = Array.isArray(dto.to)
      ? dto.to.map(createContact)
      : [createContact(dto.to)];

    await this.client.post("send").request({
      Messages: [
        {
          From: from,
          To: to,
          Subject: dto.subject,
          TextPart: dto.text,
          HTMLPart: dto.html,
          CustomID: "AppGettingStartedTest",
        },
      ],
    });
  }
}
