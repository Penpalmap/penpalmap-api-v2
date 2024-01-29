import { Request } from "express";
import { User } from "./user/user.model";
export interface IGetUserAuthInfoRequest extends Request {
  user: User; // or any other type
}
