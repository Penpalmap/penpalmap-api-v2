import { MessageDto } from "../../message/dto/message.dto";
import { UserDto } from "../../user/dto/user.dto";

export type RoomDto = {
  id: string;
  members?: UserDto[];
};
