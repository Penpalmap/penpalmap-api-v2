import { Request, Response } from "express";
import jwt, { Secret } from "jsonwebtoken";

export function authenticateToken(req: Request, res: Response, next: any) {
  const token = req.headers["authorization"];

  if (typeof token === "undefined") {
    return res.status(403).json({ message: "Unauthorized" });
  }
  const bearer = token.split(" ");
  const bearerToken = bearer[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  jwt.verify(bearerToken, "secret", (err, decoded) => {
    if (err) {
      console.error(err);
      return res.status(403).json({ message: "Unauthorized" });
    }
    next();
  });
}
