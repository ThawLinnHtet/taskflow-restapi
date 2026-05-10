import { Request, Response, NextFunction } from "express";
import { AppError } from "../errors/AppError.js";
import { Prisma } from "@prisma/client";
import multer from "multer";
import config from "../../config/env.js";
import { apiError, type ErrorDetail } from "../utils/response.js";

const ERROR_CODE_MAP: Record<string, string> = {
  P2025: "NOT_FOUND",
  P2002: "DUPLICATE_VALUE",
};

interface ValidationErrorPayload {
  statusCode?: number;
  code?: string;
  message: string;
  details?: ErrorDetail[];
  isOperational?: boolean;
}

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let code = "INTERNAL_ERROR";
  let message = "Something went wrong";
  let details: ErrorDetail[] | undefined;
  let isOperational = false;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    isOperational = err.isOperational;
    code = `ERROR_${statusCode}`;
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    isOperational = true;
    code = ERROR_CODE_MAP[err.code] || "DATABASE_ERROR";

    switch (err.code) {
      case "P2025":
        statusCode = 404;
        message = "Resource not found";
        break;
      case "P2002":
        statusCode = 409;
        message = "Duplicate value";
        break;
      default:
        statusCode = 400;
        message = "Database error";
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    code = "VALIDATION_ERROR";
    message = "Invalid data format";
    isOperational = true;
  } else if (err instanceof multer.MulterError) {
    isOperational = true;
    code = "FILE_UPLOAD_ERROR";

    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File too large (max 5MB)";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      statusCode = 400;
      message = "Too many files (max 5)";
    } else {
      statusCode = 400;
      message = err.message;
    }
  } else if (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    "details" in err
  ) {
    const validationErr = err as ValidationErrorPayload;
    statusCode = validationErr.statusCode || 422;
    code = validationErr.code || "VALIDATION_ERROR";
    message = validationErr.message;
    details = validationErr.details;
    isOperational = true;
  }

  if (!isOperational || config.env === "development") {
    console.error(err);
  }

  return apiError(res, statusCode, code, message, details);
};