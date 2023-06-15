import { Request, Response } from "express";
import { userService } from "../services/userService";

const MapController = {
  getUsers: async (req: Request, res: Response) => {
    try {
      const users = await userService.getUsersInMap();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default MapController;
