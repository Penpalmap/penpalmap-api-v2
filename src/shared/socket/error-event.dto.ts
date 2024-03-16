export const ERROR_EVENT = 'ERROR';

export class ErrorEventDto {
  eventId: string;
  relatedEventId?: string;
  status: number;
  message: string;
}
