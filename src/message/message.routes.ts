import { BaseRouter } from "../shared/base.router";
import { asyncErrorWrapper } from "../shared/async-error-wrapper";
import { MessageController } from "./message.controller";

export class MessageRouter extends BaseRouter {
  private static instance: MessageRouter;
  private readonly messageController: MessageController;

  private constructor() {
    super();
    this.messageController = MessageController.getInstance();

    this.router.post(
      "/",
      asyncErrorWrapper(this.messageController.createMessage)
    );
  }

  public static getInstance(): MessageRouter {
    if (!MessageRouter.instance) {
      MessageRouter.instance = new MessageRouter();
    }

    return MessageRouter.instance;
  }
}
