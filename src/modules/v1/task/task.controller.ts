import { Request, Response } from "express";
import { Task } from "@prisma/client";
import * as taskService from "./task.service.js";
import type { TaskResponseDTO, PaginationQuery } from "./task.types.js";
import { asyncHandler } from "../../../common/utils/asyncHandler.js";
import { AppError } from "../../../common/errors/AppError.js";
import { apiSuccess, apiCreated, apiError, apiNoContent, createMeta } from "../../../common/utils/response.js";


const mapToResponse = (task: Task): TaskResponseDTO => ({
  id: task.id,
  title: task.title,
  description: task.description ?? undefined,
  status: task.status,
  priority: task.priority,
  userId: task.userId,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
});

export const createTask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  const task = await taskService.createTask({ ...req.body, userId });
  return apiCreated(res, mapToResponse(task));
});

export const getAllTasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  const query: PaginationQuery = {
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 10,
    cursor: req.query.cursor as string | undefined,
    sortBy: (req.query.sortBy as PaginationQuery["sortBy"]) || "createdAt",
    sortOrder: (req.query.sortOrder as PaginationQuery["sortOrder"]) || "desc",
    status: req.query.status as PaginationQuery["status"],
    priority: req.query.priority as PaginationQuery["priority"],
    search: req.query.search as string,
  };
  const result = await taskService.getTasksWithPagination(userId, query);
  return res.status(200).json({
    data: result.data,
    meta: { ...createMeta(), pagination: result.meta.pagination },
  });
});

export const getTaskById = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = req.user!.userId;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  const task = await taskService.getTaskById(id, userId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return apiSuccess(res, mapToResponse(task));
});

export const updateTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = req.user!.userId;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  const task = await taskService.updateTask(id, req.body, userId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  return apiSuccess(res, mapToResponse(task));
});

export const deleteTask = asyncHandler(async (req: Request, res: Response) => {
  const id = String(req.params.id);
  const userId = req.user!.userId;
  if (!userId) {
    throw new AppError("User ID is required", 400);
  }
  const task = await taskService.getTaskById(id, userId);
  if (!task) {
    throw new AppError("Task not found", 404);
  }
  await taskService.deleteTask(id, userId);
  return apiNoContent(res);
});