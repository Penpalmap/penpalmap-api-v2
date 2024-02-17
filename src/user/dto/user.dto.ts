import { Point } from "typeorm";
import UserImage from "../user-image.model";

export type UserDto = {
  id: string;
  name: string;
  email: string;
  googleId?: string;
  geom?: Point;
  points: number;
  iamge?: string;
  gender?: string;
  birthday?: Date;
  bio?: string;
  isNewUser: boolean;
  connections: number;
  languageUsed?: string;
  avatarNumber?: number;
  userImages?: UserImage[];
  isOnline: boolean;
};
