import { Router } from "express";
import * as TaskController from "./task.controller.js";
import { createTaskSchema, updateTaskSchema, taskQuerySchema, paramsSchema } from "./task.schema.js";
import { validate } from "../../../common/middleware/validate.js";
import { authMiddleware } from "../../../common/middleware/auth.middleware.js";

const router = Router();

router.use(authMiddleware);

/**
 * @openapi
 * /api/v1/tasks:
 *   get:
 *     tags: [Tasks]
 *     summary: List tasks with pagination, search, sort, and filter
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageParam'
 *       - $ref: '#/components/parameters/limitParam'
 *       - $ref: '#/components/parameters/cursorParam'
 *       - $ref: '#/components/parameters/sortByParam'
 *       - $ref: '#/components/parameters/sortOrderParam'
 *       - $ref: '#/components/parameters/statusParam'
 *       - $ref: '#/components/parameters/priorityParam'
 *       - $ref: '#/components/parameters/searchParam'
 *     responses:
 *       200:
 *         description: Paginated task list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get(
  "/",
  validate(taskQuerySchema),
  TaskController.getAllTasks
);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   get:
 *     tags: [Tasks]
 *     summary: Get a single task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/:id", validate(paramsSchema), TaskController.getTaskById);

/**
 * @openapi
 * /api/v1/tasks:
 *   post:
 *     tags: [Tasks]
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskCreateRequest'
 *     responses:
 *       201:
 *         description: Task created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       422:
 *         $ref: '#/components/responses/Validation'
 */
router.post(
  "/",
  validate(createTaskSchema),
  TaskController.createTask
);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   patch:
 *     tags: [Tasks]
 *     summary: Update a task (partial)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskUpdateRequest'
 *     responses:
 *       200:
 *         description: Task updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/Task'
 *                 meta:
 *                   $ref: '#/components/schemas/Meta'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/Validation'
 */
router.patch(
  "/:id",
  validate(paramsSchema),
  validate(updateTaskSchema),
  TaskController.updateTask
);

/**
 * @openapi
 * /api/v1/tasks/{id}:
 *   delete:
 *     tags: [Tasks]
 *     summary: Delete a task (also deletes attachments)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskId'
 *     responses:
 *       204:
 *         description: Task deleted
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete("/:id", validate(paramsSchema), TaskController.deleteTask);

export default router;
