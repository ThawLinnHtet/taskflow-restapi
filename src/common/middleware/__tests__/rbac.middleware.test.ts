import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { requireRole } from "../rbac.middleware.js";

describe("requireRole middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it("should throw 401 if req.user is missing", () => {
    expect(() => requireRole("ADMIN")(req as Request, res as Response, next)).toThrow("Unauthorized");
  });

  it("should throw 403 if role is not allowed", () => {
    req.user = { userId: "user-1", role: "USER" };
    expect(() => requireRole("ADMIN")(req as Request, res as Response, next)).toThrow("Forbidden");
  });

  it("should call next if role is allowed", () => {
    req.user = { userId: "admin-1", role: "ADMIN" };
    requireRole("ADMIN")(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });

  it("should allow multiple roles", () => {
    req.user = { userId: "user-1", role: "USER" };
    requireRole("USER", "ADMIN")(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
