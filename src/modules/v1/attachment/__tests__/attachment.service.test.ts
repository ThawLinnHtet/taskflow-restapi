import { describe, it, expect, beforeEach, jest } from "@jest/globals";

const mockPrisma = {
  task: {
    findFirst: jest.fn(),
  },
  taskAttachment: {
    findMany: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
  },
};

const mockUploadToCloudinary = jest.fn().mockResolvedValue({});
const mockDeleteFromCloudinary = jest.fn().mockResolvedValue(undefined);

jest.unstable_mockModule("../../../../config/prisma.js", () => ({ default: mockPrisma }));
jest.unstable_mockModule("../../../../common/utils/cloudinary.js", () => ({
  uploadToCloudinary: mockUploadToCloudinary,
  deleteFromCloudinary: mockDeleteFromCloudinary,
}));

const { uploadAttachments, getAttachments, deleteAttachment } = await import("../attachment.service.js");

describe("attachment service", () => {
  const mockTask = { id: "task-1", userId: "user-1" };
  const mockAttachment = {
    id: "att-1",
    taskId: "task-1",
    url: "https://cloudinary.com/img.png",
    format: "png",
    bytes: 1024,
    originalName: "photo.png",
    resourceType: "image",
    publicId: "test_abc",
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.task.findFirst.mockResolvedValue(mockTask);
  });

  describe("uploadAttachments", () => {
    const mockFile = {
      buffer: Buffer.from("test"),
      mimetype: "image/png",
      originalname: "photo.png",
    } as Express.Multer.File;

    it("should upload files and save to DB", async () => {
      mockUploadToCloudinary.mockResolvedValue({
        public_id: "taskflow/test_abc",
        secure_url: "https://cloudinary.com/img.png",
        format: "png",
        bytes: 1024,
        resource_type: "image",
      });
      mockPrisma.taskAttachment.create.mockResolvedValue(mockAttachment);

      const result = await uploadAttachments([mockFile], "user-1", "task-1");

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe("https://cloudinary.com/img.png");
    });

    it("should throw if task does not belong to user", async () => {
      mockPrisma.task.findFirst.mockResolvedValue(null);

      await expect(uploadAttachments([mockFile], "user-2", "task-1")).rejects.toThrow("Task not found");
    });

    it("should clean up uploaded files on DB failure", async () => {
      mockUploadToCloudinary.mockResolvedValue({
        public_id: "taskflow/test_abc",
        secure_url: "url",
        format: "png",
        bytes: 1024,
        resource_type: "image",
      });
      mockPrisma.taskAttachment.create.mockRejectedValue(new Error("DB error"));

      await expect(uploadAttachments([mockFile], "user-1", "task-1")).rejects.toThrow("DB error");
      expect(mockDeleteFromCloudinary).toHaveBeenCalledWith("taskflow/test_abc", "image");
    });
  });

  describe("getAttachments", () => {
    it("should return attachments for a task", async () => {
      mockPrisma.taskAttachment.findMany.mockResolvedValue([mockAttachment]);

      const result = await getAttachments("task-1", "user-1");

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe("https://cloudinary.com/img.png");
    });
  });

  describe("deleteAttachment", () => {
    it("should delete attachment from DB and Cloudinary", async () => {
      mockPrisma.taskAttachment.findFirst.mockResolvedValue(mockAttachment);
      mockPrisma.taskAttachment.delete.mockResolvedValue(mockAttachment);

      await deleteAttachment("att-1", "task-1", "user-1");

      expect(mockPrisma.taskAttachment.delete).toHaveBeenCalledWith({ where: { id: "att-1" } });
      expect(mockDeleteFromCloudinary).toHaveBeenCalledWith("test_abc", "image");
    });

    it("should throw if attachment not found", async () => {
      mockPrisma.taskAttachment.findFirst.mockResolvedValue(null);

      await expect(deleteAttachment("bad-id", "task-1", "user-1")).rejects.toThrow("Attachment not found");
    });

    it("should not throw if cloudinary delete fails", async () => {
      mockPrisma.taskAttachment.findFirst.mockResolvedValue(mockAttachment);
      mockPrisma.taskAttachment.delete.mockResolvedValue(mockAttachment);
      mockDeleteFromCloudinary.mockRejectedValue(new Error("cloud error"));

      await expect(deleteAttachment("att-1", "task-1", "user-1")).resolves.not.toThrow();
    });
  });
});
