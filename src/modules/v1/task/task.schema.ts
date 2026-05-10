import { z } from "zod";

export const TaskStatusEnum = z.enum(["TODO", "IN_PROGRESS", "DONE"]);
export const TaskPriorityEnum = z.enum(["LOW", "MEDIUM", "HIGH"]);

export const paramsSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Task ID is required"),
  }),
});

export const querySchema = z.object({
  userId: z.string().min(1, "userId is required"),
}).optional();

export const createTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().max(200, "Description too long").optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    description: z.string().max(200, "Description too long").optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: "At least one field is required for update",
  }),
});

export const taskQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10),
    cursor: z.string().optional(),
    sortBy: z.enum(["title", "status", "priority", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    search: z.string().optional(),
  }),
});