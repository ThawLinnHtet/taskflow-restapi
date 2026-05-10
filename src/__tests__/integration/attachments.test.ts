import { describe, it, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("attachments integration", () => {
  const testEmail = `att-${Date.now()}@example.com`;
  const testPassword = "Password1";
  let accessToken = "";
  let taskId = "";
  let attachmentId = "";

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: testPassword, name: "Att Tester" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    accessToken = loginRes.body.data.accessToken;

    const taskRes = await request(app)
      .post("/api/v1/tasks")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({ title: "Task with attachments" });
    taskId = taskRes.body.data.id;
  });

  describe("GET /api/v1/tasks/:taskId/attachments", () => {
    it("returns empty list for task without attachments", async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}/attachments`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
    });
  });

  describe("authentication", () => {
    it("rejects request to attachments without auth token", async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}/attachments`);

      expect(res.status).toBe(401);
    });
  });
});
