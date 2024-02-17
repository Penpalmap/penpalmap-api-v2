// app.ts

import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { AppRouter } from "./app.router";
import { handleError } from "../shared/error-handler.middleware";

// Load environment variables and connect to the database
dotenv.config();

const app = express();
const router = AppRouter.getInstance();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(
  cors({
    origin: "*", // ou spécifiez les origines autorisées
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Routes
app.use("/api/v1", router.routes);
app.use("/api", router.routes); // For compatibility with the previous version of the API

// Error handling
app.use((_req: Request, res: Response): void => {
  res.sendStatus(404);
});
app.use(handleError);

export default app;
