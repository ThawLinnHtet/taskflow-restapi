import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { validate } from "../validate.js";

describe("validate middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { body: {}, query: {}, params: {} };
    res = {};
    next = jest.fn();
  });

  it("should call next on valid input", () => {
    const schema = z.object({
      body: z.object({ email: z.string().email() }),
    });
    req.body = { email: "test@example.com" };

    validate(schema)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("should pass validation error to next on invalid input", () => {
    const schema = z.object({
      body: z.object({ email: z.string().email() }),
    });
    req.body = { email: "invalid" };

    validate(schema)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
    const error = next.mock.calls[0][0];
    expect(error.code).toBe("VALIDATION_ERROR");
    expect(error.statusCode).toBe(422);
    expect(error.details).toBeDefined();
  });

  it("should validate query and params", () => {
    const schema = z.object({
      query: z.object({ page: z.coerce.number().int().positive().default(1) }),
      params: z.object({ id: z.string().min(1) }),
    });
    req.query = { page: "3" };
    req.params = { id: "task-1" };

    validate(schema)(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith();
  });
});
