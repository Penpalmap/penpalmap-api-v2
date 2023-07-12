import { Room } from "../../sequelize/models/Room";
import { User } from "../../sequelize/models/User";
import bcrypt from "bcrypt";
import sequelize from "../../sequelize/sequelize";

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

  async getUserRooms(id: string): Promise<User | null> {
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
    });
  },

  async getUserProfile(id: string): Promise<User | null> {
    return await User.findByPk(id, {
      include: ["userImages"],
    });
  },
};
