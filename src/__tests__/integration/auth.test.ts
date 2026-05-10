import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";

describe("auth integration", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "Password1";
  let accessToken = "";

  describe("POST /api/auth/register", () => {
    it("creates a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmail, password: testPassword, name: "Integration Test" });

      expect(res.status).toBe(201);
      expect(res.body.data.email).toBe(testEmail);
    });

    it("rejects duplicate email", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(400);
    });

    it("rejects weak password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "weak@example.com", password: "short" });

      expect(res.status).toBe(422);
    });
  });

  describe("auth flow (login → refresh → access → logout)", () => {
    const agent = request.agent(app);

    it("login returns access token and sets cookie", async () => {
      const res = await agent
        .post("/api/auth/login")
        .send({ email: testEmail, password: testPassword });

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();

      accessToken = res.body.data.accessToken;
    });

    it("refresh returns new access token using stored cookie", async () => {
      const res = await agent
        .post("/api/auth/refresh");

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.accessToken).not.toBe(accessToken);
    });

    it("refresh rejects without cookie", async () => {
      const res = await request(app)
        .post("/api/auth/refresh");

      expect(res.status).toBe(401);
    });

    it("access token works for protected routes", async () => {
      const res = await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
    });

    it("logout succeeds", async () => {
      const res = await agent
        .post("/api/auth/logout");

      expect(res.status).toBe(200);
    });

    it("refresh after logout fails", async () => {
      const res = await agent
        .post("/api/auth/refresh");

      expect(res.status).toBe(401);
    });
  });

  describe("POST /api/auth/login", () => {
    it("rejects invalid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: testEmail, password: "wrong" });

      expect(res.status).toBe(401);
    });
  });
});
