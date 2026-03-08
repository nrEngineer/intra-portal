import { Hono } from "hono";
import { cors } from "hono/cors";
import { api } from "./routes.js";
import { auth, users } from "./auth-routes.js";
import { employees } from "./employee-routes.js";
import { schedule } from "./schedule-routes.js";
import { links } from "./link-routes.js";
import { docs } from "./document-routes.js";
import { uploads } from "./upload-routes.js";

const app = new Hono();

app.use(
  "/*",
  cors({
    origin: (origin) => origin || "*",
    credentials: true,
  }),
);

app.route("/api/announcements", api);
app.route("/api/auth", auth);
app.route("/api/users", users);
app.route("/api/employees", employees);
app.route("/api/schedule", schedule);
app.route("/api/links", links);
app.route("/api/documents", docs);
app.route("/api/uploads", uploads);

export { app };
