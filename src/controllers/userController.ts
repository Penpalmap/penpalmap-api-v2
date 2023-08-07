import { Request, Response } from "express";
import { userService } from "../services/userService";
import { UploadService } from "../services/uploadService";

export const UserController = {
  // Get all users
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const users = await userService.getUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Get user by id
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Get user by email
  async getUserByEmail(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getUserByEmail(req.params.email);
      console.log(user);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Get user by googleId
  async getUserByGoogleId(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getUserByGoogleId(req.params.googleId);
      if (!user) {
        res.json(null);
      } else {
        res.json(user);
      }
    } catch (error) {
      res.status(500).json({ error: "error" });
    }
  },

  // Create user
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.createUser(req.body);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error });
    }
  },

  // Update user
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      await userService.updateUser(req.params.id, req.body);
      res.json({ message: "User updated successfully" });
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  // Get User Rooms
  async getUserRooms(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getUserRooms(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async uploadUserImage(req: Request, res: Response): Promise<void> {
    try {
      const { position } = req.body;
      const file = req.file;
      const userId = req.params.id;

      const user = await UploadService.uploadUserImage({
        userId,
        position,
        file,
      });
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async getUserProfile(req: Request, res: Response): Promise<void> {
    try {
      const user = await userService.getUserProfile(req.params.id);
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async deleteUserProfileImage(req: Request, res: Response): Promise<void> {
    try {
      console.log("PASSE");
      const { id, position } = req.params;
      const user = await userService.deleteUserProfileImage(
        id,
        parseInt(position)
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },

  async reorderUserProfileImages(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { sourceIndex, destinationIndex } = req.body;
      const user = await userService.reorderUserProfileImages(
        id,
        sourceIndex,
        destinationIndex
      );
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error });
    }
  },
};
