export const ROOM_CREATED_EVENT = 'ROOM_CREATED';

export class RoomCreatedEventDto {
  eventId: string;
  userId: string;
  roomId: string;
}
