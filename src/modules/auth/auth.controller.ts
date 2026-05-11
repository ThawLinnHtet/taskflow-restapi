
import { Request, Response } from "express";
import * as authService from "./auth.service.js";
import { asyncHandler } from "../../common/utils/asyncHandler.js";
import { apiSuccess, apiCreated } from "../../common/utils/response.js";
import { AppError } from "../../common/errors/AppError.js";

const REFRESH_TOKEN_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const user = await authService.register(req.body);
  return apiCreated(res, user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await authService.login(req.body);
  res.cookie("refreshToken", result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return apiSuccess(res, {
    accessToken: result.accessToken,
    user: result.user,
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  if (!refreshTokenCookie) {
    throw new AppError("No refresh token provided", 401);
  }
  const result = await authService.refreshToken(refreshTokenCookie);
  res.cookie("refreshToken", result.refreshToken, REFRESH_TOKEN_COOKIE_OPTIONS);
  return apiSuccess(res, {
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshTokenCookie = req.cookies?.refreshToken;
  if (refreshTokenCookie) {
    await authService.logout(refreshTokenCookie);
    res.clearCookie("refreshToken", REFRESH_TOKEN_COOKIE_OPTIONS);
  }
  return apiSuccess(res, { message: "Logged out successfully" });
});