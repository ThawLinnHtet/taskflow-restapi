import prisma from "../../config/prisma.js";
import { RegisterDTO, LoginDTO } from "./auth.schema.js";
import bcrypt from "bcrypt";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "../../common/utils/jwt.js";
import { AppError } from "../../common/errors/AppError.js";

const REFRESH_TOKEN_EXPIRY_DAYS = 7;

export const register = async (data: RegisterDTO) => {
    const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (existingUser) {
        throw new AppError("Email already exists", 400 );
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
        data: {
            email: data.email,
            password: hashedPassword,
            name: data.name,
        },
    });
    return {
        id: user.id,
        name: user.name,
        email: user.email,
    }
};

export const login = async (data: LoginDTO) => {
    const user = await prisma.user.findUnique({
        where: { email: data.email },
    });
    if (!user) {
        throw new AppError("Invalid credentials", 401);
    }
    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new AppError("Invalid credentials", 401);
    }
    
    const accessToken = createAccessToken({ userId: user.id, role: user.role });
    const refreshTokenStr = createRefreshToken({ userId: user.id, role: user.role });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    
    await prisma.refreshToken.create({
        data: {
            token: refreshTokenStr,
            userId: user.id,
            expiresAt,
        },
    });

return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
          id: user.id,
          name: user.name,
          email: user.email, 
          role: user.role,
      },    
  };
};

export const refreshToken = async (refreshTokenStr: string) => {
    const decoded = verifyRefreshToken(refreshTokenStr);
    
    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshTokenStr },
    });
    
    if (!storedToken) {
        throw new AppError("Invalid refresh token", 401);
    }
    
    if (storedToken.revokedAt) {
        throw new AppError("Refresh token has been revoked", 401);
    }
    
    if (storedToken.expiresAt < new Date()) {
        throw new AppError("Refresh token has expired", 401);
    }
    
    const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
    });
    
    if (!user) {
        throw new AppError("User not found", 401);
    }
    
    await prisma.refreshToken.update({
        where: { token: refreshTokenStr },
        data: { revokedAt: new Date() },
    });
    
    const newAccessToken = createAccessToken({ userId: user.id, role: user.role });
    const newRefreshTokenStr = createRefreshToken({ userId: user.id, role: user.role });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);
    
    await prisma.refreshToken.create({
        data: {
            token: newRefreshTokenStr,
            userId: user.id,
            expiresAt,
        },
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshTokenStr,
    };
};

export const logout = async (refreshTokenStr: string) => {
    await prisma.refreshToken.updateMany({
        where: { token: refreshTokenStr },
        data: { revokedAt: new Date() },
    });
};

export const logoutAll = async (userId: string) => {
    await prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
    });
};