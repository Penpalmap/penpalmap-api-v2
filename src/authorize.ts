import { NextFunction } from "express";
import User from "./user/user.model";
import jwt from "jsonwebtoken";

export const authenticateToken = (req, res, next: NextFunction) => {
  const authorization = req.headers.authorization;

  const token = authorization?.split(" ")[1]; // Bearer TOKEN

  if (token == null) return res.sendStatus(401); // Pas de token, non autorisé

  jwt.verify(token, process.env.JWT_SECRET, (err: Error, user: User) => {
    if (err) return res.sendStatus(401); // Token non valide ou expiré

    req.user = user;
    next(); // L'utilisateur est authentifié, continuer à la route suivante
  });
};
