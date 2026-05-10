import { createTaskSchema, updateTaskSchema, taskQuerySchema } from "../task.schema.js";

describe("task schemas", () => {
  describe("createTaskSchema", () => {
    it("should accept valid task body", () => {
      const result = createTaskSchema.safeParse({
        body: { title: "My task", description: "desc", status: "TODO", priority: "HIGH" },
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty title", () => {
      const result = createTaskSchema.safeParse({
        body: { title: "" },
      });
      expect(result.success).toBe(false);
    });

    it("should reject description over 200 chars", () => {
      const result = createTaskSchema.safeParse({
        body: { title: "Task", description: "a".repeat(201) },
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const result = createTaskSchema.safeParse({
        body: { title: "Task", status: "INVALID" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("updateTaskSchema", () => {
    it("should accept partial update", () => {
      const result = updateTaskSchema.safeParse({
        body: { title: "Updated" },
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty body", () => {
      const result = updateTaskSchema.safeParse({
        body: {},
      });
      expect(result.success).toBe(false);
    });

    it("should reject invalid status", () => {
      const result = updateTaskSchema.safeParse({
        body: { status: "INVALID" },
      });
      expect(result.success).toBe(false);
    });
  });

  describe("taskQuerySchema", () => {
    it("should accept empty query", () => {
      const result = taskQuerySchema.safeParse({ query: {} });
      expect(result.success).toBe(true);
    });

    it("should set defaults for page and limit", () => {
      const result = taskQuerySchema.parse({ query: {} });
      expect(result.query.page).toBe(1);
      expect(result.query.limit).toBe(10);
    });

    it("should coerce page to number", () => {
      const result = taskQuerySchema.parse({ query: { page: "3" } });
      expect(result.query.page).toBe(3);
    });

    it("should reject limit > 100", () => {
      const result = taskQuerySchema.safeParse({ query: { limit: 101 } });
      expect(result.success).toBe(false);
    });

    it("should accept cursor", () => {
      const result = taskQuerySchema.safeParse({ query: { cursor: "cm8x123abc" } });
      expect(result.success).toBe(true);
    });
  });
});
