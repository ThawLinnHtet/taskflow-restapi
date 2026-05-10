import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .refine((password) => /[A-Z]/.test(password), {
    message: "Password must contain at least one uppercase letter",
  })
  .refine((password) => /[a-z]/.test(password), {
    message: "Password must contain at least one lowercase letter",
  })
  .refine((password) => /[0-9]/.test(password), {
    message: "Password must contain at least one number",
  });

export const registerSchemaBody = z.object({
  email: z.string().email("Invalid email format"),
  password: passwordSchema,
  name: z.string().optional(),
});

export const loginSchemaBody = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchemaBody = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterDTO = z.infer<typeof registerSchemaBody>;
export type LoginDTO = z.infer<typeof loginSchemaBody>;
export type RefreshTokenDTO = z.infer<typeof refreshTokenSchemaBody>;

export const registerSchema = z.object({
  body: registerSchemaBody,
});

export const loginSchema = z.object({
  body: loginSchemaBody,
});

export const refreshTokenSchema = z.object({
  body: refreshTokenSchemaBody,
});