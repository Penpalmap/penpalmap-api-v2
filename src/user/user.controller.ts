import { Request, Response } from "express";
import { UserService } from "./user.service";
import { QueryUserDto } from "./dto/query-user.dto";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UpdatePasswordDto } from "./dto/update-password.dto";
import { BadRequestException } from "../shared/exception/http4xx.exception";

export class UserController {
  private static instance: UserController;
  private readonly userService: UserService;

  private constructor() {
    this.userService = UserService.getInstance();
  }

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController();
    }

    return UserController.instance;
  }

  // Get all users
  getUsers = async (
    req: Request<never, never, never, QueryUserDto, never>,
    res: Response
  ): Promise<void> => {
    res.json(await this.userService.getUsers(req.query));
  };

  // Get user by id
  getUserById = async (
    req: Request<{ id: string }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    const user = await this.userService.getUserById(req.params.id);
    res.json(user);
  };

  // Create user
  createUser = async (
    req: Request<never, never, CreateUserDto, never, never>,
    res: Response
  ): Promise<void> => {
    const user = await this.userService.createUser(req.body);
    res.status(201).json(user);
  };

  // Update user
  updateUser = async (
    req: Request<{ id: string }, never, UpdateUserDto, never, never>,
    res: Response
  ): Promise<void> => {
    const response = await this.userService.updateUser(req.params.id, req.body);
    res.json(response);
  };

  // Delete user
  deleteUser = async (
    req: Request<{ id: string }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    await this.userService.deleteUser(req.params.id);
    res.sendStatus(204);
  };

  // Upload user image
  uploadImage = async (
    req: Request<{ id: string }, never, { position: number }, never>,
    res: Response
  ): Promise<void> => {
    const { position } = req.body;
    const image = req.file;
    const userId = req.params.id;

    if (!image) {
      throw new BadRequestException("Image not found");
    }

    const userImage = await this.userService.uploadImage(userId, {
      position,
      image,
    });
    res.json(userImage);
  };

  // Delete user image
  deleteImage = async (
    req: Request<{ id: string; position: number }, never, never, never, never>,
    res: Response
  ): Promise<void> => {
    const { id, position } = req.params;
    await this.userService.deleteImage(id, position);
    res.sendStatus(204);
  };

  // Reorder user images
  reorderImages = async (
    req: Request<
      { id: string },
      never,
      { newImagesOrder: number[] },
      never,
      never
    >,
    res: Response
  ): Promise<void> => {
    const user = await this.userService.reorderImages(req.params.id, {
      order: req.body.newImagesOrder,
    });
    res.json(user);
  };

  // Update user password
  updateUserPassword = async (
    req: Request<{ id: string }, never, UpdatePasswordDto, never, never>,
    res: Response
  ): Promise<void> => {
    await this.userService.updateUserPassword(req.params.id, req.body);
    res.sendStatus(204);
  };
}
