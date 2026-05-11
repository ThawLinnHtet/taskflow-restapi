import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { Response } from "express";
import { apiSuccess, apiCreated, apiNoContent, apiError } from "../response.js";

describe("response helpers", () => {
  let res: Partial<Response>;

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
  });

  describe("apiSuccess", () => {
    it("should return 200 with data and meta", () => {
      apiSuccess(res as Response, { id: "1" });
      expect(res.status).toHaveBeenCalledWith(200);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.data).toEqual({ id: "1" });
      expect(jsonArg.meta.requestId).toBeTruthy();
      expect(jsonArg.meta.timestamp).toBeTruthy();
    });
  });

  describe("apiCreated", () => {
    it("should return 201 with data and meta", () => {
      apiCreated(res as Response, { name: "test" });
      expect(res.status).toHaveBeenCalledWith(201);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.data).toEqual({ name: "test" });
    });
  });

  describe("apiNoContent", () => {
    it("should return 204 with no body", () => {
      apiNoContent(res as Response);
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.json).not.toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe("apiError", () => {
    it("should return error shape with code and message", () => {
      apiError(res as Response, 400, "VALIDATION_ERROR", "Bad input");
      expect(res.status).toHaveBeenCalledWith(400);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.error.code).toBe("VALIDATION_ERROR");
      expect(jsonArg.error.message).toBe("Bad input");
    });

    it("should include details when provided", () => {
      const details = [{ field: "email", message: "Invalid email" }];
      apiError(res as Response, 422, "VALIDATION_ERROR", "Bad input", details);
      const jsonArg = (res.json as jest.Mock).mock.calls[0][0];
      expect(jsonArg.error.details).toEqual(details);
    });
  });
});
