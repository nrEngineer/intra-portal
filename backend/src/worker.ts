import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema.js";
import { api } from "./routes.js";
import { auth, users } from "./auth-routes.js";
import { employees } from "./employee-routes.js";
import { schedule } from "./schedule-routes.js";
import { links } from "./link-routes.js";
import { docs } from "./document-routes.js";
import { uploads } from "./upload-routes.js";

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors({ origin: "*", credentials: true }));

app.route("/api/announcements", api);
app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/employees", employees);
app.route("/api/schedule", schedule);
app.route("/api/links", links);
app.route("/api/documents", docs);
app.route("/api/uploads", uploads);

export default app;
