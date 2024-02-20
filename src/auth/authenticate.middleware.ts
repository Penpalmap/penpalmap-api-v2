import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload, VerifyErrors } from "jsonwebtoken";
import {
  ForbiddenException,
  UnauthorizedException,
} from "../shared/exception/http4xx.exception";

export const authenticate = (
  req: Request & { userId?: string },
  res: Response,
  next: NextFunction
) => {
  const authorization = req.headers.authorization;
  const token = authorization?.split(" ")[1];

  if (token == null) {
    throw new UnauthorizedException("No token provided");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET ?? "secret",
    (err: VerifyErrors | null, payload?: JwtPayload | string): void => {
      if (err) {
        throw new ForbiddenException("Invalid token");
      }

      if (!payload || typeof payload === "string") {
        throw new ForbiddenException("Invalid token");
      }

      if (typeof payload.userId !== "string") {
        throw new ForbiddenException("Invalid token");
      }

      req.userId = payload.userId;
      next(); // User is authenticated, continue to the next route
    }
  );
};
