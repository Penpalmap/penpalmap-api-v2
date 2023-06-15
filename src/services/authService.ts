import bcrypt from "bcrypt";
import { User } from "../../sequelize/models/User";

export const authService = {
  // Login user with Credentials
  async loginUserWithCredentials(credentials: any) {
    const { email, password } = credentials;
    const user = await User.scope("withPassword").findOne({
      where: {
        email: email,
      },
    });

    if (!user) {
      throw new Error("Incorrect credentials");
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log(isPasswordValid);
      if (!isPasswordValid) {
        throw new Error("Incorrect credentials");
      }
      return user;
    }
  },
};
