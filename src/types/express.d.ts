import "express";

declare global {
  namespace Express {
    namespace Multer {
      interface File {
        fieldname: string;
        originalname: string;
        encoding: string;
        mimetype: string;
        size: number;
        buffer: Buffer;
      }
    }

    interface Request {
      user?: {
        userId: string;
        role: "USER" | "ADMIN";
      };
      file?: Multer.File | undefined;
      files?: Multer.File[] | Record<string, Multer.File[]> | undefined;
    }
  }
}

export {};