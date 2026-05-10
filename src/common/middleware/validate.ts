import { ZodTypeAny, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validate =
  (schema: ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      return next();
    } catch (err: unknown) {
      if (err instanceof ZodError) {
        return next({
          statusCode: 422,
          code: "VALIDATION_ERROR",
          message: "Validation failed",
          details: err.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
          isOperational: true,
        });
      }

      return next(err);
    }
  };