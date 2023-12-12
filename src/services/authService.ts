import bcrypt from "bcrypt";
import { User } from "../../sequelize/models/User";
import crypto from "crypto";
import { ResetPassword } from "../../sequelize/models/ResetPassword";
import { mailjetConfig } from "../../mailjetConfig";
import jwt from "jsonwebtoken";
import { userService } from "./userService";
import { OAuth2Client } from "google-auth-library";
import { UserImages } from "../../sequelize/models/UserImages";

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

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return token;
    } catch (error) {
      console.error("Error in loginUserWithCredentials:", error);
      throw error; // Propagate the error
    }
  },

  async forgotPassword(email: string) {
    try {
      const user = await User.findOne({
        where: {
          email: email,
        },
      });

      if (!user) {
        console.error("User not found for email:", email);

        return {
          success: false,
          message: "Aucun utilisateur n'a été trouvé avec cette adresse email",
        };
      }

      const resetToken = crypto.randomBytes(32).toString("hex");

      await ResetPassword.create({
        userId: user.id,
        token: resetToken,
      } as ResetPassword);

      const urlToResetPassword = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;

      mailjetConfig.post("send", { version: "v3.1" }).request({
        Messages: [
          {
            From: {
              Email: "contact@penpalmap.com",
              Name: "Penpalmap",
            },
            To: [
              {
                Email: email,
                Name: user.name,
              },
            ],
            Subject: "Réinitialisation de votre mot de passe",
            TextPart: `Bonjour ${user.name},\n\nVous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.\n\n${urlToResetPassword}`,
            HTMLPart: `<h3>Bonjour ${user.name},</h3><p>Vous avez demandé la réinitialisation de votre mot de passe. Veuillez cliquer sur le lien ci-dessous pour le réinitialiser.</p><p><a href=${urlToResetPassword}>Réinitialiser mon mot de passe</a></p>`,
            CustomID: "AppGettingStartedTest",
          },
        ],
      });

      return {
        success: true,
        message:
          "Un e-mail a été envoyé avec les instructions pour réinitialiser le mot de passe.",
      };
    } catch (error) {
      console.error("Error in forgotPassword:", error);
      throw error; // Propagate the error
    }
  },

  async verifyTokenResetPassword(token: string) {
    try {
      const resetToken = await ResetPassword.findOne({
        where: { token },
      });

      if (!resetToken) {
        return { success: false, message: "Invalid token" };
      }

      if (resetToken.expiresAt.getTime() < Date.now()) {
        return { success: false, message: "Token has expired" };
      }

      return { message: "Password reset successful", success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while resetting the password",
      };
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      const resetToken = await ResetPassword.findOne({
        where: { token },
      });

      const user = await User.findOne({
        where: { id: resetToken?.userId },
      });

      if (!user) {
        return { success: false, message: "User not found" };
      }

      user.password = await bcrypt.hash(password, 10);
      await user.save();

      await resetToken?.destroy();

      return { message: "Password reset successful", success: true };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "An error occurred while resetting the password",
      };
    }
  },

  async loginUser(credentials: any) {
    const token = this.loginUserWithCredentials(credentials);

    return token;
  },

  async registerUser(user: User) {
    try {
      const userCreated = await userService.createUser(user);

      const token = jwt.sign(
        { id: userCreated.id, email: userCreated.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      console.log("user", user);
      return token;
    } catch (error) {
      console.error("Error in registerUser:", error);
      throw error; // Propagate the error
    }
  },

  async loginUserWithGoogle(tokenGoogle: string) {
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    const ticket = await client.verifyIdToken({
      idToken: tokenGoogle,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      throw new Error("Error getting payload");
    }

    const { email, sub, name } = payload;

    // if the user exists
    const user = await User.findOne({
      where: {
        googleId: sub,
        email: email,
      },
    });

    if (user) {
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        {
          expiresIn: "1h",
        }
      );

      return token;
    } else {
      const firstname = name?.split(" ")[0];

      const newUser = await userService.createUser({
        name: firstname,
        email: payload.email,
        googleId: payload.sub,
      } as User);

      const token = jwt.sign(
        { id: newUser.id, email: newUser.email },
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );

      return token;
    }
  },
};
