import { registerSchemaBody, loginSchemaBody } from "../auth.schema.js";

describe("auth schemas", () => {
  describe("registerSchemaBody", () => {
    it("should accept valid input", () => {
      const result = registerSchemaBody.safeParse({
        email: "test@example.com",
        password: "Password1",
        name: "Test",
      });
      expect(result.success).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = registerSchemaBody.safeParse({
        email: "invalid",
        password: "Password1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const result = registerSchemaBody.safeParse({
        email: "test@example.com",
        password: "password1",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password without number", () => {
      const result = registerSchemaBody.safeParse({
        email: "test@example.com",
        password: "Passworddd",
      });
      expect(result.success).toBe(false);
    });

    it("should reject password shorter than 8 chars", () => {
      const result = registerSchemaBody.safeParse({
        email: "test@example.com",
        password: "Pass1",
      });
      expect(result.success).toBe(false);
    });

    it("should accept input without name", () => {
      const result = registerSchemaBody.safeParse({
        email: "test@example.com",
        password: "Password1",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("loginSchemaBody", () => {
    it("should accept valid email and password", () => {
      const result = loginSchemaBody.safeParse({
        email: "test@example.com",
        password: "secret",
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty password", () => {
      const result = loginSchemaBody.safeParse({
        email: "test@example.com",
        password: "",
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid email", () => {
      const result = loginSchemaBody.safeParse({
        email: "bad-email",
        password: "secret",
      });
      expect(result.success).toBe(false);
    });
  });
});
