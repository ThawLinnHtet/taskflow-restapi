import prisma from "../../../config/prisma.js";
import { CreateTaskDTO, UpdateTaskDTO, PaginationQuery, PaginatedResponse, TaskResponseDTO } from "./task.types.js";
import { deleteFromCloudinary } from "../../../common/utils/cloudinary.js";

const mapToResponseDTO = (task: {
  id: string;
  title: string;
  description: string | null;
  status: import("@prisma/client").TaskStatus;
  priority: import("@prisma/client").TaskPriority;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}): TaskResponseDTO => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  status: task.status,
  priority: task.priority,
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const createTask = async (data: CreateTaskDTO) => {
  return await prisma.task.create({
    data,
  });
};

export const getTasks = async (userId: string) => {
  return await prisma.task.findMany({
    where: { userId },
  });
};

export const getTasksWithPagination = async (
  userId: string,
  query: PaginationQuery
): Promise<PaginatedResponse<TaskResponseDTO>> => {
  const { page, limit, cursor, sortBy, sortOrder, status, priority, search } = query;

  const where = {
    userId,
    ...(status && { status }),
    ...(priority && { priority }),
    ...(search && {
      OR: [
        { title: { contains: search, mode: "insensitive" as const } },
        { description: { contains: search, mode: "insensitive" as const } },
      ],
    }),
  };

  const orderBy = [{ [sortBy]: sortOrder }, { id: sortOrder }] as Record<string, string>[];

  if (cursor) {
    const tasks = await prisma.task.findMany({
      where,
      cursor: { id: cursor },
      skip: 1,
      take: limit + 1,
      orderBy,
    });

    const hasNext = tasks.length > limit;
    const data = (hasNext ? tasks.slice(0, limit) : tasks).map(mapToResponseDTO);
    const nextCursor = hasNext ? data[data.length - 1].id : null;

    return {
      data,
      meta: {
        pagination: {
          type: "cursor",
          limit,
          nextCursor,
          hasNext,
        },
      },
    };
  }

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    prisma.task.findMany({
      where,
      skip,
      take: limit,
      orderBy,
    }),
    prisma.task.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    data: tasks.map(mapToResponseDTO),
    meta: {
      pagination: {
        type: "offset",
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    },
  };
};

export const getTaskById = async (id: string, userId: string) => {
  return await prisma.task.findFirst({
    where: { id, userId },
  });
};

export const updateTask = async (id: string, data: UpdateTaskDTO, userId: string) => {
  return await prisma.task.update({
    where: { id, userId },
    data,
  });
};

export const deleteTask = async (id: string, userId: string) => {
  const attachments = await prisma.taskAttachment.findMany({ where: { taskId: id } });

  await prisma.task.delete({
    where: { id, userId },
  });

  for (const att of attachments) {
    await deleteFromCloudinary(att.publicId, att.resourceType as "image" | "raw").catch(() => {});
  }
};  