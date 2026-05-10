import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Request, Response, NextFunction } from "express";
import { asyncHandler } from "../asyncHandler.js";

describe("asyncHandler", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(() => {
    req = {};
    res = {};
    next = jest.fn();
  });

  it("should call the wrapped function", async () => {
    const fn = jest.fn().mockResolvedValue(undefined);
    const handler = asyncHandler(fn);
    await handler(req as Request, res as Response, next);
    expect(fn).toHaveBeenCalledWith(req, res, next);
  });

  it("should catch errors and pass to next", async () => {
    const error = new Error("async error");
    const fn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(fn);
    await handler(req as Request, res as Response, next);
    expect(next).toHaveBeenCalledWith(error);
  });

  it("should not call next on success", async () => {
    const fn = jest.fn().mockResolvedValue("ok");
    const handler = asyncHandler(fn);
    await handler(req as Request, res as Response, next);
    expect(next).not.toHaveBeenCalled();
  });
});
