import { Request, Response } from "express";
import * as attachmentService from "./attachment.service.js";
import { asyncHandler } from "../../../common/utils/asyncHandler.js";
import { AppError } from "../../../common/errors/AppError.js";
import { apiCreated, apiSuccess, apiNoContent } from "../../../common/utils/response.js";

export const uploadAttachments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const taskId = String(req.params.taskId);

  if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
    throw new AppError("No files provided", 400);
  }

  const files = req.files as Express.Multer.File[];
  const attachments = await attachmentService.uploadAttachments(files, userId, taskId);
  return apiCreated(res, attachments);
});

export const getAttachments = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const taskId = String(req.params.taskId);

  const attachments = await attachmentService.getAttachments(taskId, userId);
  return apiSuccess(res, attachments);
});

export const deleteAttachment = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const taskId = String(req.params.taskId);
  const attachmentId = String(req.params.id);

  await attachmentService.deleteAttachment(attachmentId, taskId, userId);
  return apiNoContent(res);
});
