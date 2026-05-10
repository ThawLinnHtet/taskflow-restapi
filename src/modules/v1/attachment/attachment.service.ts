import prisma from "../../../config/prisma.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../../common/utils/cloudinary.js";
import { AppError } from "../../../common/errors/AppError.js";
import type { AttachmentResponseDTO } from "./attachment.types.js";

const mapToResponseDTO = (attachment: {
  id: string;
  taskId: string;
  url: string;
  format: string | null;
  bytes: number | null;
  originalName: string;
  resourceType: string;
  createdAt: Date;
}): AttachmentResponseDTO => ({
  id: attachment.id,
  taskId: attachment.taskId,
  url: attachment.url,
  format: attachment.format,
  bytes: attachment.bytes,
  originalName: attachment.originalName,
  resourceType: attachment.resourceType,
  createdAt: attachment.createdAt,
});

const verifyTaskOwnership = async (taskId: string, userId: string) => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId },
  });
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return task;
};

export const uploadAttachments = async (
  files: Express.Multer.File[],
  userId: string,
  taskId: string
): Promise<AttachmentResponseDTO[]> => {
  await verifyTaskOwnership(taskId, userId);

  const results: AttachmentResponseDTO[] = [];
  const uploadedPublicIds: { publicId: string; resourceType: "image" | "raw" }[] = [];

  try {
    for (const file of files) {
      const result = await uploadToCloudinary(
        file.buffer,
        file.mimetype,
        file.originalname,
        userId,
        taskId
      );

      uploadedPublicIds.push({
        publicId: result.public_id,
        resourceType: result.resource_type,
      });

      const attachment = await prisma.taskAttachment.create({
        data: {
          taskId,
          publicId: result.public_id,
          url: result.secure_url,
          resourceType: result.resource_type,
          format: result.format,
          bytes: result.bytes,
          originalName: file.originalname,
        },
      });

      results.push(mapToResponseDTO(attachment));
    }

    return results;
  } catch (error) {
    for (const uploaded of uploadedPublicIds) {
      await deleteFromCloudinary(uploaded.publicId, uploaded.resourceType).catch(() => {});
    }
    throw error;
  }
};

export const getAttachments = async (
  taskId: string,
  userId: string
): Promise<AttachmentResponseDTO[]> => {
  await verifyTaskOwnership(taskId, userId);

  const attachments = await prisma.taskAttachment.findMany({
    where: { taskId },
    orderBy: { createdAt: "desc" },
  });

  return attachments.map(mapToResponseDTO);
};

export const deleteAttachment = async (
  attachmentId: string,
  taskId: string,
  userId: string
): Promise<void> => {
  await verifyTaskOwnership(taskId, userId);

  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, taskId },
  });

  if (!attachment) {
    throw new AppError("Attachment not found", 404);
  }

  await prisma.taskAttachment.delete({
    where: { id: attachmentId },
  });

  await deleteFromCloudinary(
    attachment.publicId,
    attachment.resourceType as "image" | "raw"
  ).catch(() => {});
};
