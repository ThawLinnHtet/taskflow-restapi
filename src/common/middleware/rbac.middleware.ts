import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";

export type Role = "USER" | "ADMIN";

export const requireRole = (...allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError("Unauthorized", 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden", 403);
    }

    next();
  };
};