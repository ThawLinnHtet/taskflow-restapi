import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import taskRoutes from "./modules/v1/task/task.routes.js";
import attachmentRoutes from "./modules/v1/attachment/attachment.routes.js";
import { errorHandler } from "./common/middleware/errorHandler.js";
import { AppError } from "./common/errors/AppError.js";
import authRoutes from "./modules/auth/auth.route.js";
import { apiRateLimiter } from "./common/middleware/rateLimiter.js";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";

const app = express();

app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compression());


app.use("/api/auth", authRoutes);

app.use("/api/v1/tasks", apiRateLimiter, taskRoutes);
app.use("/api/v1/tasks/:taskId/attachments", apiRateLimiter, attachmentRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "TaskFlow API Docs",
}));

app.get("/api-docs.json", (req, res) => res.json(swaggerSpec));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use((req, res, next) => {
  next(new AppError(`Cannot ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

export default app;