export type UploadDataInput = {
  userId: string;
  position: number;
  file: any;
};

export type MessageInput = {
  content: string;
  roomId: string | null | undefined;
  senderId: string;
  receiverId: string;
};
