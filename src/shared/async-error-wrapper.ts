import { Request, Response, NextFunction } from "express";

export const asyncErrorWrapper = <
  Params = never,
  ReqBody = never,
  ResBody = any,
  ReqQuery = qs.ParsedQs
>(
  fn: (
    req: Request<Params, never, ReqBody, ReqQuery, never>,
    res: Response<ResBody, never>
  ) => Promise<void>
) => {
  return (
    req: Request<Params, never, ReqBody, ReqQuery, never>,
    res: Response<ResBody, never>,
    next: NextFunction
  ): void => {
    fn(req, res).catch(next);
  };
};
