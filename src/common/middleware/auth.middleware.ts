import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, TokenPayload } from "../utils/jwt.js";
import { AppError } from "../errors/AppError.js";

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header) {
    throw new AppError("No token provided", 401);
  }

  const token = header.split(" ")[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded as TokenPayload;
    next();
  } catch (err) {
    throw new AppError("Invalid token", 401);
  }
};