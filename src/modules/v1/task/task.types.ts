import { TaskStatus, TaskPriority } from "@prisma/client";

export type CreateTaskDTO = {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  userId: string;
};

export type UpdateTaskDTO = Partial<CreateTaskDTO>;

export type TaskResponseDTO = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PaginationQuery = {
  page: number;
  limit: number;
  cursor?: string;
  sortBy: "title" | "status" | "priority" | "createdAt" | "updatedAt";
  sortOrder: "asc" | "desc";
  status?: TaskStatus;
  priority?: TaskPriority;
  search?: string;
};

type OffsetMeta = {
  type: "offset";
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
};

type CursorMeta = {
  type: "cursor";
  limit: number;
  nextCursor: string | null;
  hasNext: boolean;
};

export type PaginationMeta = {
  pagination: OffsetMeta | CursorMeta;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};