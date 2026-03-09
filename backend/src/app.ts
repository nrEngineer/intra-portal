import { Hono } from "hono";
import { cors } from "hono/cors";
import { createContainer } from "./di/container.js";
import { createAuthMiddleware } from "./infrastructure/http/middleware/auth.middleware.js";
import { createAuthRoutes, createUserRoutes } from "./infrastructure/http/routes/auth.routes.js";
import { createAnnouncementRoutes } from "./infrastructure/http/routes/announcement.routes.js";
import { createEmployeeRoutes } from "./infrastructure/http/routes/employee.routes.js";
import { createScheduleRoutes } from "./infrastructure/http/routes/schedule.routes.js";
import { createLinkRoutes } from "./infrastructure/http/routes/link.routes.js";
import { createDocumentRoutes } from "./infrastructure/http/routes/document.routes.js";
import { createUploadRoutes } from "./infrastructure/http/routes/upload.routes.js";
import { errorHandler } from "./infrastructure/http/error-mapper.js";

export const container = createContainer();
const authMiddleware = createAuthMiddleware(container.tokenService);

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(",") ?? ["http://localhost:5173"],
    credentials: true,
  }),
);

app.route("/api/announcements", createAnnouncementRoutes(container, authMiddleware));
app.route("/api/auth", createAuthRoutes(container));
app.route("/api/users", createUserRoutes(container, authMiddleware));
app.route("/api/employees", createEmployeeRoutes(container, authMiddleware));
app.route("/api/schedule", createScheduleRoutes(container, authMiddleware));
app.route("/api/links", createLinkRoutes(container, authMiddleware));
app.route("/api/documents", createDocumentRoutes(container, authMiddleware));
app.route("/api/uploads", createUploadRoutes(container, authMiddleware));

app.onError(errorHandler);

export { app };
