export const USER_TYPING_EVENT = 'USER_TYPING';

export class UserTypingEventDto {
  eventId: string;
  userId: string;
  roomId: string;
  isTyping: boolean;
}
