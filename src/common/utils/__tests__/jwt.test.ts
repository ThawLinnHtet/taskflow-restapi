import { describe, it, expect, beforeEach } from "@jest/globals";
import { createAccessToken, createRefreshToken, verifyAccessToken, verifyRefreshToken, createToken, verifyToken } from "../jwt.js";

describe("jwt utils", () => {
  const payload = { userId: "user-1", role: "USER" as const };

  beforeEach(() => {
    process.env.JWT_SECRET = "test-secret";
    process.env.JWT_REFRESH_SECRET = "test-refresh";
  });

  describe("createAccessToken", () => {
    it("should create a valid access token", () => {
      const token = createAccessToken(payload);
      expect(token).toBeTruthy();
      expect(typeof token).toBe("string");
    });

    it("should create a token that can be verified", () => {
      const token = createAccessToken(payload);
      const decoded = verifyAccessToken(token);
      expect(decoded.userId).toBe(payload.userId);
      expect(decoded.role).toBe(payload.role);
    });
  });

  describe("createRefreshToken", () => {
    it("should create a valid refresh token", () => {
      const token = createRefreshToken(payload);
      expect(token).toBeTruthy();
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(payload.userId);
    });
  });

  describe("verifyAccessToken", () => {
    it("should throw on invalid token", () => {
      expect(() => verifyAccessToken("invalid")).toThrow();
    });

    it("should throw on malformed tokens", () => {
      expect(() => verifyAccessToken("")).toThrow();
      expect(() => verifyAccessToken("not-a.jwt.token")).toThrow();
    });
  });

  describe("verifyRefreshToken", () => {
    it("should throw on invalid token", () => {
      expect(() => verifyRefreshToken("invalid")).toThrow();
    });
  });

  describe("aliases", () => {
    it("createToken should be same as createAccessToken", () => {
      expect(createToken).toBe(createAccessToken);
    });

    it("verifyToken should be same as verifyAccessToken", () => {
      expect(verifyToken).toBe(verifyAccessToken);
    });
  });
});
