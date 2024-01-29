import { NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../user/user.model";

export const authenticate = (req, res, next: NextFunction) => {
  const authorization = req.headers.authorization;
  const token = authorization?.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // No token, unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: Error, user: User) => {
    if (err) {
      return res.sendStatus(401); // Invalid token, unauthorized
    }

    req.user = user;
    next(); // User is authenticated, continue to the next route
  });
};
