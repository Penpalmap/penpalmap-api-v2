import { UserController } from "./user.controller";
import { upload } from "../minio/minio.config";
import { BaseRouter } from "../shared/base.router";
import { asyncErrorWrapper } from "../shared/async-error-wrapper";

export class UserRouter extends BaseRouter {
  private static instance: UserRouter;
  private readonly userController: UserController;

  private constructor() {
    super();
    this.userController = UserController.getInstance();

    this.router.get("/", asyncErrorWrapper(this.userController.getUsers));
    this.router.get("/:id", asyncErrorWrapper(this.userController.getUserById));
    this.router.get(
      "/email/:email",
      asyncErrorWrapper(this.userController.getUserByEmail)
    );
    this.router.post("/", asyncErrorWrapper(this.userController.createUser));
    this.router.put("/:id", asyncErrorWrapper(this.userController.updateUser));
    this.router.delete(
      "/:id",
      asyncErrorWrapper(this.userController.deleteUser)
    );
    this.router.get(
      "/googleId/:googleId",
      asyncErrorWrapper(this.userController.getUserByGoogleId)
    );
    this.router.post(
      "/:id/image",
      upload.single("profileImage"),
      asyncErrorWrapper(this.userController.uploadImage)
    );
    this.router.get(
      "/:id/profile",
      asyncErrorWrapper(this.userController.getUserById)
    );
    this.router.delete(
      "/:id/profile/images/:position",
      asyncErrorWrapper(this.userController.deleteImage)
    );
    this.router.put(
      "/:id/profile/reorder",
      asyncErrorWrapper(this.userController.reorderImages)
    );
    this.router.put(
      "/:id/password",
      asyncErrorWrapper(this.userController.updateUserPassword)
    );
  }

  static getInstance(): UserRouter {
    if (!UserRouter.instance) {
      UserRouter.instance = new UserRouter();
    }

    return UserRouter.instance;
  }
}
