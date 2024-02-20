import { UserService } from "../user/user.service";

export class MapService {
  private static instance: MapService;
  private readonly userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MapService {
    if (!MapService.instance) {
      MapService.instance = new MapService();
    }

    return MapService.instance;
  }

  public async getUsersInMap() {
    return await this.userService.getUsersInMap();
  }
}
