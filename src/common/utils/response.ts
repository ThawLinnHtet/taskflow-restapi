import { Response } from "express";
import { randomUUID } from "crypto";

export interface ErrorDetail {
  field: string;
  message: string;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: ErrorDetail[];
}

export interface Meta {
  requestId: string;
  timestamp: string;
}

export interface ApiSuccessResponse<T> {
  data: T;
  meta: Meta;
}

export interface ApiErrorResponse {
  error: ErrorResponse;
  meta: Meta;
}

export const createMeta = (): Meta => ({
  requestId: randomUUID(),
  timestamp: new Date().toISOString(),
});

export const apiSuccess = <T>(res: Response, data: T, statusCode = 200) => {
  return res.status(statusCode).json({
    data,
    meta: createMeta(),
  });
};

export const apiError = (
  res: Response,
  statusCode: number,
  code: string,
  message: string,
  details?: ErrorDetail[]
) => {
  return res.status(statusCode).json({
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: createMeta(),
  });
};

export const apiCreated = <T>(res: Response, data: T) => {
  return apiSuccess(res, data, 201);
};

export const apiNoContent = (res: Response) => {
  return res.status(204).json({ meta: createMeta() });
};