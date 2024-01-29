export type MessageInput = {
  content: string;
  roomId: string | null | undefined;
  senderId: string;
  receiverId: string;
};
