import { Request, Response } from "express";
import { MessageService } from "./message.service";
import { CreateMessageDto } from "./dto/create-message.dto";
import { QueryMessagesDto } from "./dto/query-messages.dto";
import { UpdateMessageDto } from "./dto/update-message.dto";
import { UnauthorizedException } from "../shared/exception/http4xx.exception";

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
    req: Request<
      never,
      never,
      Omit<CreateMessageDto, "senderId">,
      never,
      never
    > & { userId?: string },
    res: Response
  ): Promise<void> => {
    if (!req.userId) {
      throw new UnauthorizedException("No user id in request");
    }
    const message = await this.messageService.createMessage({
      ...req.body,
      senderId: req.userId,
    });
    res.json(message);
  };

  getMessages = async (
    req: Request<never, never, never, QueryMessagesDto, never>,
    res: Response
  ): Promise<void> => {
    const messages = await this.messageService.getMessages(req.query);
    res.json(messages);
  };

  getMessageById = async (
    req: Request<{ id: string }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    const message = await this.messageService.getMessageById(req.params.id);
    res.json(message);
  };

  updateMessage = async (
    req: Request<{ id: string }, never, UpdateMessageDto, never, never>,
    res: Response
  ): Promise<void> => {
    const message = await this.messageService.updateMessage(
      req.params.id,
      req.body
    );
    res.json(message);
  };

  deleteMessage = async (
    req: Request<{ id: string }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    await this.messageService.deleteMessage(req.params.id);
    res.sendStatus(204);
  };
}
