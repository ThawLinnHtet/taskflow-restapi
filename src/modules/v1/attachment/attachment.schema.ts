import { z } from "zod";

export const attachmentParamsSchema = z.object({
  params: z.object({
    taskId: z.string().min(1, "Task ID is required"),
    id: z.string().min(1).optional(),
  }),
});
