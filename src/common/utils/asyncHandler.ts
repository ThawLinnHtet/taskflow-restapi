import { Request, Response, NextFunction, RequestHandler } from "express";

type AsyncHandlerFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => unknown | Promise<unknown>;

export const asyncHandler = (fn: AsyncHandlerFn): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};