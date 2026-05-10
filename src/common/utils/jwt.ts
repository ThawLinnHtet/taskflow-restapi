import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";

export interface TokenPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

const JWT_SECRET = process.env.JWT_SECRET || (() => {
  if (process.env.NODE_ENV === "production") throw new Error("JWT_SECRET required");
  return "dev-secret-only";
})();

const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || JWT_SECRET;

const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_EXPIRES_IN = "7d";

export const createAccessToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    algorithm: "HS256",
    jwtid: randomUUID(),
  });
};

export const createRefreshToken = (payload: TokenPayload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    algorithm: "HS256",
    jwtid: randomUUID(),
  });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
};

export const createToken = createAccessToken;
export const verifyToken = verifyAccessToken;