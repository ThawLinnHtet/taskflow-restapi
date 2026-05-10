import { randomUUID } from "crypto";
import cloudinary from "../../config/cloudinary.js";

interface UploadResult {
  public_id: string;
  secure_url: string;
  format: string;
  bytes: number;
  resource_type: "image" | "raw";
}

const sanitizeFilename = (originalName: string): string => {
  const extIndex = originalName.lastIndexOf(".");
  const basename = extIndex > 0 ? originalName.slice(0, extIndex) : originalName;

  let sanitized = basename
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (sanitized.length > 80) {
    sanitized = sanitized.slice(0, 80);
  }

  const shortId = randomUUID().slice(0, 8);
  return `${sanitized}_${shortId}`;
};

export const uploadToCloudinary = (
  buffer: Buffer,
  mimeType: string,
  originalName: string,
  userId: string,
  taskId: string
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const resourceType = mimeType.startsWith("image/") ? "image" : "raw";
    const publicId = sanitizeFilename(originalName);

    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: publicId,
        folder: `taskflow/${userId}/${taskId}`,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned no result"));
        resolve({
          public_id: result.public_id,
          secure_url: result.secure_url,
          format: result.format,
          bytes: result.bytes,
          resource_type: resourceType,
        });
      }
    );

    stream.end(buffer);
  });
};

export const deleteFromCloudinary = (
  publicId: string,
  resourceType: "image" | "raw"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: resourceType }, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
};
