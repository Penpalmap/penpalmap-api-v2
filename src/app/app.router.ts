import { authenticate } from "../auth/authenticate.middleware";
import { AuthRouter } from "../auth/auth.routes";
import { MapRouter } from "../map/map.routes";
import { MessageRouter } from "../message/message.routes";
import { RoomRouter } from "../room/room.routes";
import { UserRouter } from "../user/user.routes";
import { BaseRouter } from "../shared/base.router";

export class AppRouter extends BaseRouter {
  private static instance: AppRouter;
  private readonly authRouter: AuthRouter;
  private readonly mapRouter: MapRouter;
  private readonly messageRouter: MessageRouter;
  private readonly roomRouter: RoomRouter;
  private readonly userRouter: UserRouter;

  private constructor() {
    super();
    this.authRouter = AuthRouter.getInstance();
    this.mapRouter = MapRouter.getInstance();
    this.messageRouter = MessageRouter.getInstance();
    this.roomRouter = RoomRouter.getInstance();
    this.userRouter = UserRouter.getInstance();

    this.router.use("/auth", this.authRouter.routes);
    this.router.use("/map", authenticate, this.mapRouter.routes);
    this.router.use("/messages", authenticate, this.messageRouter.routes);
    this.router.use("/rooms", authenticate, this.roomRouter.routes);
    this.router.use("/users", authenticate, this.userRouter.routes);
  }

  static getInstance(): AppRouter {
    if (!AppRouter.instance) {
      AppRouter.instance = new AppRouter();
    }

    return AppRouter.instance;
  }
}
