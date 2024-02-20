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
    this.router.get("/", asyncErrorWrapper(this.messageController.getMessages));
    this.router.get(
      "/:id",
      asyncErrorWrapper(this.messageController.getMessageById)
    );
    this.router.patch(
      "/:id",
      asyncErrorWrapper(this.messageController.updateMessage)
    );
    this.router.delete(
      "/:id",
      asyncErrorWrapper(this.messageController.deleteMessage)
    );
  }

  public static getInstance(): MessageRouter {
    if (!MessageRouter.instance) {
      MessageRouter.instance = new MessageRouter();
    }

    return MessageRouter.instance;
  }
}
