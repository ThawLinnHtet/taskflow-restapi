import { attachmentParamsSchema } from "../attachment.schema.js";

describe("attachment schemas", () => {
  describe("attachmentParamsSchema", () => {
    it("should accept valid taskId", () => {
      const result = attachmentParamsSchema.safeParse({
        params: { taskId: "cm8x123abc" },
      });
      expect(result.success).toBe(true);
    });

    it("should accept taskId and id", () => {
      const result = attachmentParamsSchema.safeParse({
        params: { taskId: "cm8x123abc", id: "cm8x456def" },
      });
      expect(result.success).toBe(true);
    });

    it("should reject empty taskId", () => {
      const result = attachmentParamsSchema.safeParse({
        params: { taskId: "" },
      });
      expect(result.success).toBe(false);
    });

    it("should reject missing params", () => {
      const result = attachmentParamsSchema.safeParse({ params: {} });
      expect(result.success).toBe(false);
    });
  });
});
