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

export type UserInput = {
  id: string;
  name: string;
  email: string;
  password: string;
  googleId: string;
  geom: any;
  points: number;
  image: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
  userLanguages: any;
};

import { Request } from "express";
import { User } from "../sequelize/models/User";
export interface IGetUserAuthInfoRequest extends Request {
  user: User; // or any other type
}
