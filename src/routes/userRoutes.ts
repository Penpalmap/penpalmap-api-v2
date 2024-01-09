import { Router } from "express";
import { UserController } from "../controllers/userController";
import { upload } from "../../uploadConfig";

const router = Router();

// GET /api/users
router.get("/", UserController.getUsers);

// GET /api/users/:id
router.get("/:id", UserController.getUserById);

// GET /api/users/:email
router.get("/email/:email", UserController.getUserByEmail);

// POST /api/users
router.post("/", UserController.createUser);

// PUT /api/users/:id
router.put("/:id", UserController.updateUser);

// GET /api/users/:id/rooms
router.use("/:id/rooms", UserController.getUserRooms);

// GET /api/users/google/:googleId
router.get("/googleId/:googleId", UserController.getUserByGoogleId);

router.post(
  "/:id/image",
  upload.single("profileImage"),
  UserController.uploadUserImage
);

router.get("/:id/profile", UserController.getUserProfile);

router.delete(
  "/:id/profile/images/:position",
  UserController.deleteUserProfileImage
);

router.put("/:id/profile/reorder", UserController.reorderUserProfileImages);

router.put("/:id/password", UserController.updateUserPassword);

router.put("/:id/bio", UserController.updateBio);

export default router;
