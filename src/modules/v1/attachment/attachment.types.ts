export type AttachmentResponseDTO = {
  id: string;
  taskId: string;
  url: string;
  format: string | null;
  bytes: number | null;
  originalName: string;
  resourceType: string;
  createdAt: Date;
};
