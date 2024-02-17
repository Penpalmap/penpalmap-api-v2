import { NextFunction, Request, Response } from "express";
import { HttpException } from "./exception/http.exception";
import { InternalServerErrorException } from "./exception/http5xx.exception";

export function handleError(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const error =
    err instanceof HttpException ? err : new InternalServerErrorException();
  res.status(error.status).json({ message: error.message });

  if (error.status >= 500) {
    console.error(error.stack);
  }
}
