import { Request, Response } from "express";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";

export class MessageController {
  private static instance: MessageController;
  private readonly messageService: MessageService;

  private constructor() {
    this.messageService = MessageService.getInstance();
  }

  static getInstance(): MessageController {
    if (!MessageController.instance) {
      MessageController.instance = new MessageController();
    }
    return MessageController.instance;
  }

  createMessage = async (
    req: Request<never, never, CreateMessageDto, never, never>,
    res: Response
  ): Promise<void> => {
    const message = await this.messageService.createMessage(req.body);
    res.json(message);
  };
}
