import { NextFunction } from "express";
import { IGetUserAuthInfoRequest } from "./types/types";
import { User } from "./sequelize/models/User";

const jwt = require("jsonwebtoken");

export const authenticateToken = (req, res, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Pas de token, non autorisé

  jwt.verify(token, process.env.JWT_SECRET, (err: Error, user: User) => {
    if (err) return res.sendStatus(403); // Token non valide ou expiré

    req.user = user;
    next(); // L'utilisateur est authentifié, continuer à la route suivante
  });
};
