import { describe, it, expect, beforeAll, afterAll } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";

describe("tasks integration", () => {
  const testEmail = `tasks-${Date.now()}@example.com`;
  const testPassword = "Password1";
  let accessToken = "";
  let taskId = "";
  let anotherUserToken = "";

  beforeAll(async () => {
    await request(app)
      .post("/api/auth/register")
      .send({ email: testEmail, password: testPassword, name: "Task Tester" });

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: testEmail, password: testPassword });
    accessToken = loginRes.body.data.accessToken;

    const otherEmail = `other-${Date.now()}@example.com`;
    await request(app)
      .post("/api/auth/register")
      .send({ email: otherEmail, password: testPassword });
    const otherRes = await request(app)
      .post("/api/auth/login")
      .send({ email: otherEmail, password: testPassword });
    anotherUserToken = otherRes.body.data.accessToken;
  });

  describe("POST /api/v1/tasks", () => {
    it("creates a task", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Integration task", description: "test", priority: "HIGH" });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe("Integration task");
      expect(res.body.data.priority).toBe("HIGH");
      expect(res.body.data.userId).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      taskId = res.body.data.id;
    });

    it("rejects without auth token", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .send({ title: "Unauthorized" });

      expect(res.status).toBe(401);
    });

    it("rejects empty title", async () => {
      const res = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "" });

      expect(res.status).toBe(422);
    });
  });

  describe("GET /api/v1/tasks", () => {
    it("lists user's tasks with pagination", async () => {
      const res = await request(app)
        .get("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.meta.pagination).toBeDefined();
    });

    it("filters by status", async () => {
      const res = await request(app)
        .get("/api/v1/tasks?status=DONE")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      res.body.data.forEach((t: any) => {
        expect(t.status).toBe("DONE");
      });
    });

    it("searches by title", async () => {
      const res = await request(app)
        .get(`/api/v1/tasks?search=Integration`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it("supports offset pagination", async () => {
      const res = await request(app)
        .get("/api/v1/tasks?page=1&limit=10")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.meta.pagination.type).toBe("offset");
    });
  });

  describe("GET /api/v1/tasks/:id", () => {
    it("returns a single task", async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe(taskId);
    });

    it("returns 404 for another user's task", async () => {
      const res = await request(app)
        .get(`/api/v1/tasks/${taskId}`)
        .set("Authorization", `Bearer ${anotherUserToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/v1/tasks/:id", () => {
    it("updates a task", async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${taskId}`)
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "Updated title", status: "IN_PROGRESS" });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe("Updated title");
      expect(res.body.data.status).toBe("IN_PROGRESS");
    });
  });

  describe("DELETE /api/v1/tasks/:id", () => {
    it("deletes a task", async () => {
      const createRes = await request(app)
        .post("/api/v1/tasks")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ title: "To be deleted" });
      const deleteTarget = createRes.body.data.id;

      const res = await request(app)
        .delete(`/api/v1/tasks/${deleteTarget}`)
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(204);

      const getRes = await request(app)
        .get(`/api/v1/tasks/${deleteTarget}`)
        .set("Authorization", `Bearer ${accessToken}`);
      expect(getRes.status).toBe(404);
    });
  });
});
