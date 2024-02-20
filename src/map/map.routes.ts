import { BaseRouter } from "../shared/base.router";
import { asyncErrorWrapper } from "../shared/async-error-wrapper";
import { MapController } from "./map.controller";

export class MapRouter extends BaseRouter {
  private static instance: MapRouter;
  private readonly mapController: MapController;

  private constructor() {
    super();
    this.mapController = MapController.getInstance();

    this.router.get("/users", asyncErrorWrapper(this.mapController.getUsers));
  }

  public static getInstance(): MapRouter {
    if (!MapRouter.instance) {
      MapRouter.instance = new MapRouter();
    }

    return MapRouter.instance;
  }
}
