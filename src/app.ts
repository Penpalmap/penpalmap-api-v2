// app.ts

import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./user/user.routes";
import authRoutes from "./auth/auth.routes";
import messageRoutes from "./message/message.routes";
import mapRoutes from "./map/map.routes";
import roomRoutes from "./room/room.routes";
import { authenticateToken } from "./authorize";
import { PostgresqlService } from "./postgresql/postgresql.service";

dotenv.config();

const app: Application = express();

// Middleware pour le traitement des données JSON
app.use(express.json());

app.use(express.static("public"));

app.use(
  cors({
    origin: "*", // ou spécifiez les origines autorisées
    methods: "GET, POST, PUT, DELETE",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// Synchronisez les modèles avec la base de données
PostgresqlService.connect();

app.use("/api/auth", authRoutes);

// Middleware pour l'authentification
app.use(authenticateToken);
// Montage des routes des utilisateurs
app.use("/api/users", userRoutes);
app.use("/api/map", mapRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/rooms", roomRoutes);

// Gestion des erreurs 404 (route non trouvée)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ error: "Route not found" });
});

// Gestion des erreurs globales
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal server error" });
});

// Export de l'application Express
export default app;
