import { Router } from "express";
import * as AttachmentController from "./attachment.controller.js";
import { attachmentParamsSchema } from "./attachment.schema.js";
import { validate } from "../../../common/middleware/validate.js";
import { uploadMiddleware } from "../../../common/middleware/upload.middleware.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";

const router = Router({ mergeParams: true });

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/tasks/{taskId}/attachments:
 *   post:
 *     tags: [Attachments]
 *     summary: Upload file attachments to a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/attachmentTaskId'
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [files]
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 maxItems: 5
 *                 description: Files to upload (max 5, 5MB each). Supports JPG, PNG, GIF, WebP, PDF, TXT, DOC, DOCX.
 *     responses:
 *       201:
 *         description: Files uploaded
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       413:
 *         $ref: '#/components/responses/FileTooLarge'
 */
router.post("/", uploadMiddleware, AttachmentController.uploadAttachments);

/**
 * @openapi
 * /api/v1/tasks/{taskId}/attachments:
 *   get:
 *     tags: [Attachments]
 *     summary: List attachments for a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/attachmentTaskId'
 *     responses:
 *       200:
 *         description: Attachment list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Attachment'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/", AttachmentController.getAttachments);

/**
 * @openapi
 * /api/v1/tasks/{taskId}/attachments/{id}:
 *   delete:
 *     tags: [Attachments]
 *     summary: Delete a single attachment
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/attachmentTaskId'
 *       - $ref: '#/components/parameters/attachmentIdParam'
 *     responses:
 *       204:
 *         description: Attachment deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", validate(attachmentParamsSchema), AttachmentController.deleteAttachment);

export default router;
