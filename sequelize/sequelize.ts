import { Sequelize } from "sequelize-typescript";
import { User } from "./models/User";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST || "localhost",
  dialect: "postgres",
  storage: ":memory:",
  models: [__dirname + "/models"], // or [Player, Team],
});

export default sequelize;
