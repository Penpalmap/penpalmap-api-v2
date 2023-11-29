import bcrypt from "bcrypt";
import { User } from "../../sequelize/models/User";
import jwt from "jsonwebtoken";
import { userService } from "./userService";
import { OAuth2Client } from "google-auth-library";

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

      if (user.password) {
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          console.error("Incorrect password for user:", user.id);
          throw new Error("Incorrect credentials");
        }
        const accessToken = jwt.sign({ userId: user.id }, "secret", {
          expiresIn: "1h",
        });

        const userWithoutPassword = await User.findByPk(user.id);

        return { userWithoutPassword, accessToken }; // Retourne l'utilisateur et le token JWT
      }

      //remove password from user object
    } catch (error) {
      console.error("Error in loginUserWithCredentials:", error);
      throw error; // Propagate the error
    }
  },

  async loginUserWithGoogle(googleUser: {
    googleId: string;
    email: string;
    name: string;
    token: string;
  }) {
    try {
      const { token, googleId, email, name } = googleUser;
      const client = new OAuth2Client();
      async function verify() {
        const ticket = await client.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
          // Or, if multiple clients access the backend:
          //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
        });
        const payload = ticket.getPayload();

        if (!payload) {
          throw new Error("No payload");
        }

        const userId = payload["sub"];
        const userEmail = payload["email"];
        const userName = payload["name"];

        // Vérifie que les données renvoyées par Google correspondent aux informations fournies
        if (userId === googleId && userEmail === email && userName === name) {
          return true;
        }
        return false;
      }

      const isVerified = await verify();

      if (!isVerified) {
        throw new Error("Google verification failed");
      }

      // Les informations sont valides, vérifie si l'utilisateur existe dans la base de données
      let existingUser = await User.findOne({
        where: {
          googleId: googleId,
          email: email,
        },
      });

      if (!existingUser) {
        const newUser = await userService.createUser({
          googleId: googleId,
          email: email,
          name: name,
        } as User);

        if (!newUser) {
          throw new Error("Error creating user");
        }

        const accessToken = jwt.sign({ userId: newUser.id }, "secret", {
          expiresIn: "1h",
        });

        return { newUser, accessToken }; // Retourne l'utilisateur et le token JWT
      } else {
        const accessToken = jwt.sign({ userId: existingUser.id }, "secret", {
          expiresIn: "1h",
        });
        console.log("New user created:", accessToken);

        return { existingUser, accessToken }; // Retourne l'utilisateur et le token JWT
      }
    } catch (error) {
      console.error("Error in loginUserWithGoogle:", error);
      throw error; // Propagate the error
    }
  },
};
