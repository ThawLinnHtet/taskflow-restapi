import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockPrisma = {
  task: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  taskAttachment: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockDeleteFromCloudinary = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule("../../../../config/prisma.js", () => ({ default: mockPrisma }));
jest.unstable_mockModule("../../../../common/utils/cloudinary.js", () => ({
  deleteFromCloudinary: mockDeleteFromCloudinary,
}));

const { createTask, getTaskById, updateTask, deleteTask, getTasksWithPagination } = await import("../task.service.js");

describe("task service", () => {
  const mockTask = {
    id: "task-1",
    title: "Test task",
    description: "desc",
    status: "TODO" as const,
    priority: "MEDIUM" as const,
    userId: "user-1",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create a task", async () => {
      mockPrisma.task.create.mockResolvedValue(mockTask);

      const result = await createTask({ title: "Test task", userId: "user-1" });

      expect(result.title).toBe("Test task");
      expect(mockPrisma.task.create).toHaveBeenCalledWith({ data: { title: "Test task", userId: "user-1" } });
    });
  });

  describe("getTaskById", () => {
    it("should return task scoped to user", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(mockTask);

      const result = await getTaskById("task-1", "user-1");

      expect(result).toEqual(mockTask);
      expect(mockPrisma.task.findFirst).toHaveBeenCalledWith({ where: { id: "task-1", userId: "user-1" } });
    });

    it("should return null if not found", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      const result = await getTaskById("bad-id", "user-1");

      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update a task", async () => {
      mockPrisma.task.update.mockResolvedValue({ ...mockTask, title: "Updated" });

      const result = await updateTask("task-1", { title: "Updated" }, "user-1");

      expect(result.title).toBe("Updated");
    });
  });

  describe("deleteTask", () => {
    it("should delete task and clean up cloudinary attachments", async () => {
      mockPrisma.taskAttachment.findMany.mockResolvedValue([
        { publicId: "img1", resourceType: "image" },
        { publicId: "doc1", resourceType: "raw" },
      ]);
      mockPrisma.task.delete.mockResolvedValue(mockTask);
      mockDeleteFromCloudinary.mockResolvedValue(undefined);

      await deleteTask("task-1", "user-1");

      expect(mockPrisma.task.delete).toHaveBeenCalledWith({ where: { id: "task-1", userId: "user-1" } });
      expect(mockDeleteFromCloudinary).toHaveBeenCalledTimes(2);
    });

    it("should handle cloudinary delete failures gracefully", async () => {
      mockPrisma.taskAttachment.findMany.mockResolvedValue([
        { publicId: "img1", resourceType: "image" },
      ]);
      mockPrisma.task.delete.mockResolvedValue(mockTask);
      mockDeleteFromCloudinary.mockRejectedValue(new Error("cloud error"));

      await expect(deleteTask("task-1", "user-1")).resolves.not.toThrow();
    });
  });

  describe("getTasksWithPagination", () => {
    it("should return offset-paginated results", async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);
      mockPrisma.task.count.mockResolvedValue(1);

      const result = await getTasksWithPagination("user-1", {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.pagination.type).toBe("offset");
      if (result.meta.pagination.type === "offset") {
        expect(result.meta.pagination.page).toBe(1);
        expect(result.meta.pagination.total).toBe(1);
      }
    });

    it("should return cursor-paginated results", async () => {
      const tasks = [{ ...mockTask, id: "task-2" }, { ...mockTask, id: "task-3" }];
      mockPrisma.task.findMany.mockResolvedValue(tasks);

      const result = await getTasksWithPagination("user-1", {
        page: 1,
        limit: 1,
        cursor: "task-1",
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      expect(result.meta.pagination.type).toBe("cursor");
      if (result.meta.pagination.type === "cursor") {
        expect(result.meta.pagination.hasNext).toBe(true);
        expect(result.meta.pagination.nextCursor).toBeDefined();
      }
    });

    it("should include search filter", async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);
      mockPrisma.task.count.mockResolvedValue(1);

      await getTasksWithPagination("user-1", {
        page: 1,
        limit: 10,
        sortBy: "createdAt",
        sortOrder: "desc",
        search: "test",
      });

      const callArg = mockPrisma.task.findMany.mock.calls[0][0];
      expect(callArg.where.OR).toBeDefined();
    });
  });
});
