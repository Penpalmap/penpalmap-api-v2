import { Request, Response } from 'express';
import { userService } from '../user/user.service';
import { IGetUserAuthInfoRequest } from '../types';

const MapController = {
  getUsers: async (req: IGetUserAuthInfoRequest, res: Response) => {
    try {
      const userId = req.params.id;
      const users = await userService.getUsersInMap(userId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};

export default MapController;
