import Room from "../room/room.model";
import User from "./user.model";
import bcrypt from "bcrypt";
import Message from "../message/message.model";
import { onlineUsers } from "../globals";
import UserImages from "./user-images.model";
import UserLanguage from "./user-language.model";
import { Sequelize } from "sequelize";
import { UserInput } from "./user-input.dto";

export const userService = {
  // Get all users
  async getUsers(): Promise<User[]> {
    return await User.findAll();
  },

  // Get user by id
  async getUserById(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: ["userImages"],
    });
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
  async updateUser(id: string, user: UserInput): Promise<void> {
    try {
      const {
        latitude,
        longitude,
        userLanguages,
        ...userDataWithoutLanguages
      } = user;

      // Mettre à jour les autres champs utilisateur
      await User.update(userDataWithoutLanguages, { where: { id } });

      // Mettre à jour la colonne GEOM
      if (latitude !== undefined && longitude !== undefined) {
        await User.update(
          {
            geom: Sequelize.literal(
              `ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)`
            ),
          },
          { where: { id } }
        );
      }

      // Ajouter les nouvelles langues
      if (userLanguages && userLanguages.length > 0) {
        await UserLanguage.bulkCreate(userLanguages);
      }
    } catch (error) {
      console.log(error);
    }
  },

  async getUserRooms(id: string) {
    try {
      const user = await User.findByPk(id, {
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

                order: [["createdAt", "DESC"]],
                limit: 1,
              },
            ],
            attributes: {
              include: [
                [
                  Sequelize.literal(
                    `(SELECT COUNT(*) FROM "Messages" WHERE "Messages"."roomId" = "rooms"."id" AND "Messages"."isSeen" = false AND "Messages"."senderId" != '${id}')`
                  ),
                  "countUnreadMessages",
                ],
              ],
            },
          },
        ],
      });

      const rooms = user?.dataValues.rooms;

      // add to members an attribute called isOnline and return the user with the updated rooms
      const roomsWithMembers = rooms?.map((room: any) => {
        const members = room.dataValues?.members;

        const membersWithIsOnline = members?.map((member: any) => {
          const socketId = onlineUsers.get(member.dataValues.id);
          if (socketId) {
            member.dataValues.isOnline = true;
          } else {
            member.dataValues.isOnline = false;
          }
          return member;
        });

        room.dataValues.members = membersWithIsOnline;
        return room;
      });

      const userWithUpdatedRooms = {
        ...user?.dataValues,
        rooms: roomsWithMembers,
      };

      // console.log("userWithUpdatedRooms", userWithUpdatedRooms);

      return userWithUpdatedRooms;
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
    const user = await User.findOne({
      where: {
        googleId: googleId,
      },
    });

    return user;
  },

  async getUsersInMap(): Promise<User[]> {
    try {
      const now = Date.now();

      const ONE_DAY = 24 * 60 * 60 * 1000; // Nombre de millisecondes en un jour
      const MAX_DAYS = 365; // Nombre de jours après lesquels le score se stabilise près de la valeur minimale (à ajuster selon les besoins)

      const users = await User.findAll({
        attributes: [
          "id",
          "name",
          "image",
          "avatarNumber",
          "birthday",
          "gender",
          "updatedAt",
          "bio",
          [
            Sequelize.literal(`
          ST_Point(
            ST_X(geom) + (RANDOM() * 0.01 - 0.05),
            ST_Y(geom) + (RANDOM() * 0.01 - 0.05)
          )
          `),
            "geomR",
          ],
        ],
        include: ["userImages"],
      });

      users.forEach((user) => {
        const updateTimestamp = user.dataValues.updatedAt.getTime();
        const daysSinceUpdate = (now - updateTimestamp) / ONE_DAY;

        const score = 100 * Math.exp(-daysSinceUpdate / MAX_DAYS);
        const finalScore = Math.max(1, Math.min(Math.round(score), 100));

        user.dataValues.points = finalScore;
      });

      return users;
    } catch (error) {
      console.log(error);
    }
  },

  async getUserProfile(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: ["userImages", "userLanguages"],
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
    console.log("userImages", userImages);
    if (!userImages) {
      throw new Error("User images not found");
    }

    const imageToDelete = userImages.find(
      (image) => image.position == position
    );

    console.log("imageToDelete", imageToDelete);
    if (!imageToDelete) {
      throw new Error("Image not found");
    }

    await imageToDelete.destroy();

    const newImages = userImages.filter(
      (image) => image.id !== imageToDelete.id
    );

    console.log("newImages", newImages);

    newImages.forEach(async (image, index) => {
      await image.update({
        position: index,
      });
    });

    if (position == 0 && newImages.length > 0) {
      await User.update(
        { image: newImages[0].src },
        {
          where: {
            id: id,
          },
        }
      );
    } else if (position == 0 && newImages.length == 0) {
      await User.update(
        { image: null },
        {
          where: {
            id: id,
          },
        }
      );
    }
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

  async reorderUserProfileImages(id: string, newImagesOrder: UserImages[]) {
    const user = await User.findByPk(id, {
      include: ["userImages"],
    });
    if (!user) {
      throw new Error("User not found");
    }
    const userImages = user.dataValues.userImages.sort((a, b) => {
      return a.position - b.position;
    });

    if (!userImages) {
      throw new Error("User images not found");
    }
    const imagesIds = userImages.map((image) => image.id);

    const newImagesOrderIds = newImagesOrder.map((image) => image.id);

    if (imagesIds.length !== newImagesOrderIds.length) {
      throw new Error("Images length is not the same");
    }
    const isSameArray = imagesIds.every((id, index) => {
      return id === newImagesOrderIds[index];
    });

    if (isSameArray) {
      throw new Error("Images order is the same");
    }
    await UserImages.destroy({
      where: {
        userId: id,
      },
    });

    await UserImages.bulkCreate(newImagesOrder);

    await User.update(
      { image: newImagesOrder[0].src },
      {
        where: {
          id: id,
        },
      }
    );
  },

  async incrementUserConnection(id: string): Promise<void> {
    const user = await User.findByPk(id);

    if (!user) {
      throw new Error("User not found");
    }

    const newNbConnections = parseInt(user.connections) + 1;

    user.connections = newNbConnections.toString();

    await user.save();
  },

  async updateUserPassword(
    oldPassword: string,
    newPassword: string,
    id: string
  ): Promise<void> {
    const salt = await bcrypt.genSalt(10);

    const user = await User.scope("withPassword").findOne({
      where: {
        id: id,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      throw new Error("Password is not valid");
    }

    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await User.update(
      { password: hashedPassword },
      {
        where: {
          id: id,
        },
      }
    );
  },

  async updateBio(description: string, id: string): Promise<void> {
    await User.update(
      { bio: description },
      {
        where: {
          id: id,
        },
      }
    );
  },
};
