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
    this.router.post("/", asyncErrorWrapper(this.userController.createUser));
    this.router.patch(
      "/:id",
      asyncErrorWrapper(this.userController.updateUser)
    );
    this.router.delete(
      "/:id",
      asyncErrorWrapper(this.userController.deleteUser)
    );
    this.router.post(
      "/:id/images",
      upload.single("profileImage"),
      asyncErrorWrapper(this.userController.uploadImage)
    );
    this.router.delete(
      "/:id/images/:position",
      asyncErrorWrapper(this.userController.deleteImage)
    );
    this.router.post(
      "/:id/images/reorder",
      asyncErrorWrapper(this.userController.reorderImages)
    );
    this.router.post(
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
