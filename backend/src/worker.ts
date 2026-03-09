// Cloudflare Workers entry point — D1 integration pending
// This is a placeholder; the Node.js server (index.ts) is used for local dev.
import { Hono } from "hono";
import { cors } from "hono/cors";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./db/schema.js";
import { setDb } from "./db/connection.js";
import { setJwtSecret } from "./auth-utils.js";
import { app as nodeApp } from "./app.js";

type Bindings = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  DB: any; // D1Database — requires @cloudflare/workers-types
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// D1 injection middleware - set DB before any route handler
app.use("/*", async (c, next) => {
  const db = drizzle(c.env.DB, { schema });
  setDb(db as any);
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

// Mount Node.js app routes
app.route("/", nodeApp);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

export default app;
