import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";

const mockVerifyAccessToken = jest.fn();

jest.unstable_mockModule("../../utils/jwt.js", () => ({
  verifyAccessToken: mockVerifyAccessToken,
  verifyToken: mockVerifyAccessToken,
}));

const { authMiddleware } = await import("../auth.middleware.js");

describe("authMiddleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    jest.clearAllMocks();
  });

  it("should throw on missing authorization header", () => {
    expect(() => authMiddleware(req as Request, res as Response, next)).toThrow("No token provided");
  });

  it("should throw on invalid token", () => {
    req.headers = { authorization: "Bearer bad-token" };
    mockVerifyAccessToken.mockImplementation(() => {
      throw new Error("invalid");
    });

    expect(() => authMiddleware(req as Request, res as Response, next)).toThrow("Invalid token");
  });

  it("should set req.user and call next on valid token", () => {
    const payload = { userId: "user-1", role: "USER" as const };
    req.headers = { authorization: "Bearer valid-token" };
    mockVerifyAccessToken.mockReturnValue(payload);

    authMiddleware(req as Request, res as Response, next);

    expect(req.user).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });
});
