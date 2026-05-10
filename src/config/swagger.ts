import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "TaskFlow API",
      version: "1.0.0",
      description: "Task management REST API with JWT auth, pagination, search, sorting, and file attachments.",
      contact: {
        name: "TaskFlow Team",
        email: "team@taskflow.dev",
      },
    },
    servers: [{ url: "http://localhost:3000", description: "Local dev server" }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Meta: {
          type: "object",
          properties: {
            requestId: { type: "string", format: "uuid" },
            timestamp: { type: "string", format: "date-time" },
          },
        },
        ApiErrorResponse: {
          type: "object",
          properties: {
            error: {
              type: "object",
              properties: {
                code: { type: "string", example: "ERROR_400" },
                message: { type: "string" },
                details: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      field: { type: "string" },
                      message: { type: "string" },
                    },
                  },
                },
              },
            },
            meta: { $ref: "#/components/schemas/Meta" },
          },
        },
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "cm8x7a3b20001abc123def456" },
            email: { type: "string", format: "email", example: "user@example.com" },
            name: { type: "string", nullable: true, example: "John Doe" },
            role: { type: "string", enum: ["USER", "ADMIN"], example: "USER" },
          },
        },
        RegisterRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "user@example.com" },
            password: { type: "string", minLength: 8, example: "Password1", description: "Must be at least 8 characters, include one uppercase letter, one lowercase letter, and one number" },
            name: { type: "string", example: "John Doe" },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "admin@example.com" },
            password: { type: "string", example: "admin123" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        TokenResponse: {
          type: "object",
          properties: {
            accessToken: { type: "string" },
          },
        },
        MessageResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string", example: "cm8x7a3b20001abc123def456" },
            title: { type: "string", example: "Fix login bug" },
            description: { type: "string", nullable: true, example: "Users cannot log in via Safari" },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"], example: "TODO" },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"], example: "HIGH" },
            userId: { type: "string", example: "cm8x7a3b20001abc123def789" },
            createdAt: { type: "string", format: "date-time", example: "2026-05-10T08:00:00.000Z" },
            updatedAt: { type: "string", format: "date-time", example: "2026-05-10T08:30:00.000Z" },
          },
        },
        TaskCreateRequest: {
          type: "object",
          required: ["title"],
          properties: {
            title: { type: "string", example: "Fix login bug" },
            description: { type: "string", maxLength: 200, example: "Users cannot login on Safari" },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          },
        },
        TaskUpdateRequest: {
          type: "object",
          minProperties: 1,
          properties: {
            title: { type: "string", minLength: 1 },
            description: { type: "string", maxLength: 200 },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
          },
        },
        OffsetPagination: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["offset"] },
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
            hasNext: { type: "boolean" },
            hasPrev: { type: "boolean" },
          },
        },
        CursorPagination: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["cursor"] },
            limit: { type: "integer" },
            nextCursor: { type: "string", nullable: true },
            hasNext: { type: "boolean" },
          },
        },
        TaskListResponse: {
          type: "object",
          properties: {
            data: { type: "array", items: { $ref: "#/components/schemas/Task" } },
            meta: {
              allOf: [
                { $ref: "#/components/schemas/Meta" },
                {
                  type: "object",
                  properties: {
                    pagination: { oneOf: [{ $ref: "#/components/schemas/OffsetPagination" }, { $ref: "#/components/schemas/CursorPagination" }] },
                  },
                },
              ],
            },
          },
        },
        Attachment: {
          type: "object",
          properties: {
            id: { type: "string", example: "cm8x7a3b20001abc123def999" },
            taskId: { type: "string", example: "cm8x7a3b20001abc123def456" },
            url: { type: "string", format: "uri", example: "https://res.cloudinary.com/example/image/upload/taskflow/screenshot_abc123.png" },
            format: { type: "string", nullable: true, example: "png" },
            bytes: { type: "integer", nullable: true, example: 177686 },
            originalName: { type: "string", example: "Screenshot (129).png" },
            resourceType: { type: "string", example: "image" },
            createdAt: { type: "string", format: "date-time", example: "2026-05-10T09:50:18.395Z" },
          },
        },
      },
      parameters: {
        taskId: {
          name: "id",
          in: "path",
          required: true,
          description: "Task unique identifier (CUID)",
          schema: { type: "string" },
        },
        attachmentTaskId: {
          name: "taskId",
          in: "path",
          required: true,
          description: "Task unique identifier that owns the attachments",
          schema: { type: "string" },
        },
        attachmentIdParam: {
          name: "id",
          in: "path",
          required: true,
          description: "Attachment unique identifier (CUID)",
          schema: { type: "string" },
        },
        pageParam: {
          name: "page",
          in: "query",
          description: "Page number for offset pagination",
          schema: { type: "integer", default: 1, minimum: 1 },
        },
        limitParam: {
          name: "limit",
          in: "query",
          description: "Number of items per page (max 100)",
          schema: { type: "integer", default: 10, minimum: 1, maximum: 100 },
        },
        cursorParam: {
          name: "cursor",
          in: "query",
          description: "Cursor for cursor-based pagination — pass the last item's ID from the previous page",
          schema: { type: "string" },
        },
        sortByParam: {
          name: "sortBy",
          in: "query",
          description: "Field to sort results by",
          schema: { type: "string", enum: ["title", "status", "priority", "createdAt", "updatedAt"], default: "createdAt" },
        },
        sortOrderParam: {
          name: "sortOrder",
          in: "query",
          description: "Sort direction",
          schema: { type: "string", enum: ["asc", "desc"], default: "desc" },
        },
        statusParam: {
          name: "status",
          in: "query",
          description: "Filter tasks by status",
          schema: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE"] },
        },
        priorityParam: {
          name: "priority",
          in: "query",
          description: "Filter tasks by priority",
          schema: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
        },
        searchParam: {
          name: "search",
          in: "query",
          description: "Case-insensitive search across task title and description",
          schema: { type: "string" },
        },
      },
      responses: {
        Unauthorized: {
          description: "Missing or invalid access token",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
        NotFound: {
          description: "Resource not found",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
        Validation: {
          description: "Validation error",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
        BadRequest: {
          description: "Bad request",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
        FileTooLarge: {
          description: "File exceeds 5MB limit",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
        RateLimited: {
          description: "Too many requests",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ApiErrorResponse" } } },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Register, login, refresh token, logout" },
      { name: "Tasks", description: "Task CRUD with pagination, search, sort, and filter" },
      { name: "Attachments", description: "File upload and management on tasks" },
    ],
  },
  apis: [
    "./src/modules/auth/auth.route.ts",
    "./src/modules/v1/task/task.routes.ts",
    "./src/modules/v1/attachment/attachment.routes.ts",
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
