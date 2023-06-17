// app.ts

import express, { Application, Request, Response, NextFunction } from "express";
import userRoutes from "./src/routes/userRoutes";
import authRoutes from "./src/routes/authRoutes";
import mapRoutes from "./src/routes/mapRoutes";
import sequelize from "./sequelize/sequelize";

const app: Application = express();

// Middleware pour le traitement des données JSON
app.use(express.json());

app.use(express.static("public"));

// Synchronisez les modèles avec la base de données
sequelize
  .sync()
  .then(() => {
    console.log("Database synced");
  })
  .catch((error) => {
    console.error("Error syncing database:", error);
  });

// Middleware pour les en-têtes CORS (si nécessaire)
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

// Montage des routes des utilisateurs
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/map", mapRoutes);

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
