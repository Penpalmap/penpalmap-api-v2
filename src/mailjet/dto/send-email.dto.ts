export type EmailContact =
  | {
      email: string;
      name?: string;
    }
  | string;

export class SendEmailDto {
  from?: EmailContact;
  to: EmailContact | EmailContact[];
  subject: string;
  text: string;
  html: string;
}
