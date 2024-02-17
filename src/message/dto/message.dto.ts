import { UserDto } from "../../user/dto/user.dto";

export type MessageDto = {
  id: string;
  content: string;
  isSeen: boolean;
  sender?: UserDto;
};
