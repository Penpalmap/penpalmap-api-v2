import { Room } from "../../sequelize/models/Room";
import { User } from "../../sequelize/models/User";
import bcrypt from "bcrypt";
import sequelize from "../../sequelize/sequelize";
import { Message } from "../../sequelize/models/Message";

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return await User.findAll();
  },

  // Get user by id
  async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  },

  // Create user
  async createUser(user: User) {
    // Create user with google connection
    if (user.googleId) {
      const userExists = await User.findOne({
        where: {
          googleId: user.googleId,
          email: user.email,
        },
      });

      if (userExists) {
        // Connect user with google
      } else {
        const newUser = await User.create(user);

        // Remove password from response
        const userWithoutPassword = await User.findByPk(newUser.id);

        if (!userWithoutPassword) {
          throw new Error("Error creating user");
        }

        return userWithoutPassword;
      }
    } else {
      const userExists = await User.findOne({
        where: {
          email: user.email,
        },
      });

      if (userExists) {
        throw new Error("User already exists");
      }

      if (!user.googleId) {
        // Hash password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
      }

      const newUser = await User.create(user);

      // Remove password from response
      const userWithoutPassword = await User.findByPk(newUser.id);

      if (!userWithoutPassword) {
        throw new Error("Error creating user");
      }

      return userWithoutPassword;
    }
  },

  // Update user
  async updateUser(id: string, user: User): Promise<void> {
    await User.update(user, { where: { id } });
  },

  async getUserRooms(id: string) {
    try {
      return await User.findByPk(id, {
        include: [
          {
            model: Room,
            as: "rooms",
            include: [
              {
                model: User,
                as: "members",
              },
              {
                model: Message,
                as: "messages",
                where: {
                  isSeen: false,
                },
                order: [["createdAt", "DESC"]],
                limit: 1,
              },
            ],
            attributes: {
              include: [
                [
                  sequelize.literal(
                    `(SELECT COUNT(*) FROM "Messages" WHERE "Messages"."roomId" = "rooms"."id" AND "Messages"."isSeen" = false AND "Messages"."senderId" != '${id}')`
                  ),
                  "countUnreadMessages",
                ],
              ],
            },
          },
        ],
      });
    } catch (error) {
      console.log(error);
    }
  },

  async getUserByEmail(email: string): Promise<User | null> {
    return await User.findOne({
      where: {
        email: email,
      },
      include: ["userImages"],
    });
  },

  async getUserByGoogleId(googleId: string): Promise<User | null> {
    return await User.findOne({
      where: {
        googleId: googleId,
      },
    });
  },

  async getUsersInMap(): Promise<User[]> {
    return await User.findAll({
      attributes: ["id", "name", "latitude", "longitude", "image", "points"],
      include: ["userImages"],
    });
  },

  async getUserProfile(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: ["userImages"],
    });
  },

  async deleteUserProfileImage(id: string, position: number): Promise<void> {
    const user = await User.findByPk(id, {
      include: ["userImages"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userImages = user.dataValues.userImages;

    if (!userImages) {
      throw new Error("User images not found");
    }
    console.log("userImages", userImages);
    if (userImages.length === 1) {
      throw new Error("User must have at least one image");
    }

    const imageToDelete = userImages[position];

    if (!imageToDelete) {
      throw new Error("Image not found");
    }

    await imageToDelete.destroy();
  },

  async updateUserProfileImage(id: string, position: number): Promise<void> {
    const user = await User.findByPk(id, {
      include: ["userImages"],
    });

    if (!user) {
      throw new Error("User not found");
    }

    const userImages = user.dataValues.userImages;

    if (!userImages) {
      throw new Error("User images not found");
    }

    const imageToSetAsProfile = userImages[position];

    if (!imageToSetAsProfile) {
      throw new Error("Image not found");
    }

    await User.update(
      { image: imageToSetAsProfile.src },
      {
        where: {
          id: id,
        },
      }
    );
  },

  async reorderUserProfileImages(
    id: string,
    sourceIndex: number,
    destinationIndex: number
  ): Promise<void> {
    const user = await User.findByPk(id, {
      include: ["userImages"],
    });
    if (!user) {
      throw new Error("User not found");
    }

    const userImages = user.dataValues.userImages;

    console.log("userImages", userImages);

    if (!userImages) {
      throw new Error("User images not found");
    }

    const imageToMove = userImages[sourceIndex];

    if (!imageToMove) {
      throw new Error("Image not found");
    }

    userImages.splice(sourceIndex, 1);
    userImages.splice(destinationIndex, 0, imageToMove);

    userImages.forEach((photo, index) => {
      photo.position = index;
    });

    userImages.forEach(async (photo) => {
      await photo.save();
    });
  },
};
