export class SocketErrorDto {
  relatedEventId: string;
  message: string;

  constructor(relatedEventId: string, message: string) {
    this.relatedEventId = relatedEventId;
    this.message = message;
  }
}
