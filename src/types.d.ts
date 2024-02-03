import { Request } from "express";
import { User } from "./user/user.model";

export type MemoryFile = Omit<
  Express.Multer.File,
  "destination" | "filename" | "path"
>;

export interface IGetUserAuthInfoRequest extends Request {
  user: User; // or any other type
}
