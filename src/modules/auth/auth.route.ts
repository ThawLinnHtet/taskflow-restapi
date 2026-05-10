
import { Router } from "express";
import * as AuthController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
import { validate } from "../../common/middleware/validate.js";
import { authRateLimiter } from "../../common/middleware/rateLimiter.js";


const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/Validation'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 */
router.post("/register", authRateLimiter, validate(registerSchema), AuthController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login and receive access + refresh tokens
 *     description: Returns an access token in the response body and sets a refresh token as an httpOnly cookie.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         headers:
 *           Set-Cookie:
 *             schema:
 *               type: string
 *               example: refreshToken=eyJ...; HttpOnly; Path=/
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/AuthResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/RateLimited'
 */
router.post("/login", authRateLimiter, validate(loginSchema), AuthController.login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token using refresh cookie
 *     description: Reads the refresh token from the httpOnly cookie, verifies it, and returns a new access token.
 *     responses:
 *       200:
 *         description: New access token issued
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/TokenResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout and revoke refresh token
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/MessageResponse'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 */
router.post("/logout", AuthController.logout);

export default router;
