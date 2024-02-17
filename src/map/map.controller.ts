import { Request, Response } from "express";
import { MapService } from "./map.services";

export class MapController {
  private static instance: MapController;
  private readonly mapService: MapService;

  private constructor() {
    this.mapService = MapService.getInstance();
  }

  public static getInstance(): MapController {
    if (!MapController.instance) {
      MapController.instance = new MapController();
    }

    return MapController.instance;
  }

  getUsers = async (
    _req: Request<never, never, never, never, never>,
    res: Response
  ) => {
    const users = await this.mapService.getUsersInMap();
    res.json(users);
  };
}
