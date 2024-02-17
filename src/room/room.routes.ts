import { BaseRouter } from "../shared/base.router";
import { asyncErrorWrapper } from "../shared/async-error-wrapper";
import { RoomController } from "./room.controller";

export class RoomRouter extends BaseRouter {
  private static instance: RoomRouter;
  private readonly roomController: RoomController;

  private constructor() {
    super();
    this.roomController = RoomController.getInstance();

    this.router.get("/", asyncErrorWrapper(this.roomController.getRooms));
    this.router.get("/:id", asyncErrorWrapper(this.roomController.getRoomById));
    this.router.post("/", asyncErrorWrapper(this.roomController.createRoom));
    this.router.put("/:id", asyncErrorWrapper(this.roomController.updateRoom));
    this.router.get(
      "/:userId1/:userId2",
      asyncErrorWrapper(this.roomController.getRoomByUsers)
    );
  }

  public static getInstance(): RoomRouter {
    if (!RoomRouter.instance) {
      RoomRouter.instance = new RoomRouter();
    }

    return RoomRouter.instance;
  }
}
