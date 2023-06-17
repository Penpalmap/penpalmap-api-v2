import { Request, Response } from "express";
import { messageService } from "../services/messageService";

export const MessageController = {
  async createMessage(req: Request, res: Response): Promise<void> {
    try {
      const message = await messageService.createMessage(req.body);
      res.json(message);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: err });
    }
  },
};
