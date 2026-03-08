import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema.js";
import { setDb } from "./db/connection.js";
import { setJwtSecret } from "./auth-utils.js";
import { createTables } from "./db/create-tables.js";
import { api } from "./routes.js";
import { auth, users } from "./auth-routes.js";
import { employees } from "./employee-routes.js";
import { schedule } from "./schedule-routes.js";
import { links } from "./link-routes.js";
import { docs } from "./document-routes.js";
import { uploads } from "./upload-routes.js";

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// D1 injection middleware - set DB before any route handler
app.use("/*", async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  setDb(db);
  setJwtSecret(c.env.JWT_SECRET);
  await next();
});

app.use("/*", async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS
    ? c.env.ALLOWED_ORIGINS.split(",")
    : ["http://localhost:5173"];
  return cors({
    origin: allowedOrigins,
    credentials: true,
  })(c, next);
});

app.route("/api/announcements", api);
app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/employees", employees);
app.route("/api/schedule", schedule);
app.route("/api/links", links);
app.route("/api/documents", docs);
app.route("/api/uploads", uploads);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
