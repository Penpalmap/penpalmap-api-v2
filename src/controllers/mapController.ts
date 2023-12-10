import { Request, Response } from "express";
import { userService } from "../services/userService";
import { IGetUserAuthInfoRequest } from "../../types/types";

const MapController = {
  getUsers: async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const users = await userService.getUsersInMap();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default MapController;
