import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  refreshToken: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
};

const mockBcrypt = {
  hash: jest.fn(),
  compare: jest.fn(),
};

const mockJwt = {
  createAccessToken: jest.fn(),
  createRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
  createToken: jest.fn(),
  verifyToken: jest.fn(),
};

jest.unstable_mockModule("../../../config/prisma.js", () => ({ default: mockPrisma }));
jest.unstable_mockModule("bcrypt", () => ({ default: mockBcrypt }));
jest.unstable_mockModule("../../../common/utils/jwt.js", () => mockJwt);

const { register, login, refreshToken, logout, logoutAll } = await import("../auth.service.js");

describe("auth service", () => {
  const mockUser = {
    id: "user-1",
    email: "test@example.com",
    password: "hashed-pwd",
    name: "Test",
    role: "USER" as const,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    it("should register a new user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);
      mockBcrypt.hash.mockResolvedValue("hashed-pwd");

      const result = await register({ email: "test@example.com", password: "Password1", name: "Test" });

      expect(result.email).toBe("test@example.com");
      expect(result.id).toBe("user-1");
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it("should throw on duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        register({ email: "test@example.com", password: "Password1" })
      ).rejects.toThrow("Email already exists");
    });
  });

  describe("login", () => {
    it("should login with valid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(true);
      mockJwt.createAccessToken.mockReturnValue("access-token");
      mockJwt.createRefreshToken.mockReturnValue("refresh-token");
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await login({ email: "test@example.com", password: "Password1" });

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(result.user.email).toBe("test@example.com");
    });

    it("should throw on wrong password", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockBcrypt.compare.mockResolvedValue(false);

      await expect(
        login({ email: "test@example.com", password: "wrong" })
      ).rejects.toThrow("Invalid credentials");
    });

    it("should throw on non-existent user", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        login({ email: "no@user.com", password: "Password1" })
      ).rejects.toThrow("Invalid credentials");
    });
  });

  describe("refreshToken", () => {
    it("should refresh tokens successfully", async () => {
      const oldToken = { token: "old-refresh", userId: "user-1", revokedAt: null, expiresAt: new Date(Date.now() + 86400000) };
      mockJwt.verifyRefreshToken.mockReturnValue({ userId: "user-1", role: "USER" });
      mockPrisma.refreshToken.findUnique.mockResolvedValue(oldToken);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.refreshToken.update.mockResolvedValue({});
      mockJwt.createAccessToken.mockReturnValue("new-access");
      mockJwt.createRefreshToken.mockReturnValue("new-refresh");
      mockPrisma.refreshToken.create.mockResolvedValue({});

      const result = await refreshToken("old-refresh");

      expect(result.accessToken).toBe("new-access");
      expect(result.refreshToken).toBe("new-refresh");
    });

    it("should throw on revoked token", async () => {
      mockJwt.verifyRefreshToken.mockReturnValue({ userId: "user-1", role: "USER" });
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: "old-refresh",
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 86400000),
      });

      await expect(refreshToken("old-refresh")).rejects.toThrow("Refresh token has been revoked");
    });

    it("should throw on expired token", async () => {
      mockJwt.verifyRefreshToken.mockReturnValue({ userId: "user-1", role: "USER" });
      mockPrisma.refreshToken.findUnique.mockResolvedValue({
        token: "old-refresh",
        revokedAt: null,
        expiresAt: new Date(Date.now() - 86400000),
      });

      await expect(refreshToken("old-refresh")).rejects.toThrow("Refresh token has expired");
    });
  });

  describe("logout", () => {
    it("should revoke the refresh token", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});

      await logout("test-token");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { token: "test-token" },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });

  describe("logoutAll", () => {
    it("should revoke all active tokens for a user", async () => {
      mockPrisma.refreshToken.updateMany.mockResolvedValue({});

      await logoutAll("user-1");

      expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalledWith({
        where: { userId: "user-1", revokedAt: null },
        data: { revokedAt: expect.any(Date) },
      });
    });
  });
});
