import bcrypt from "bcrypt";
import { User } from "../../sequelize/models/User";

export const authService = {
  // Login user with Credentials
  async loginUserWithCredentials(credentials: any) {
    try {
      const { email, password } = credentials;
      const user = await User.scope("withPassword").findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        console.error("User not found for email:", email);
        throw new Error("Incorrect credentials");
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        console.error("Incorrect password for user:", user.id);
        throw new Error("Incorrect credentials");
      }

      return user;
    } catch (error) {
      console.error("Error in loginUserWithCredentials:", error);
      throw error; // Propagate the error
    }
  },
};
