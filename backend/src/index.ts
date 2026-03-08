import "dotenv/config";
import { serve } from "@hono/node-server";
import { sql } from "drizzle-orm";
import { app } from "./app.js";
import { initDb } from "./db/connection.js";
import { createTables } from "./db/create-tables.js";
import { seed } from "./db/seed.js";
import fs from "fs";
import path from "path";

const port = parseInt(process.env.PORT || "3000", 10);

async function start() {
  // Ensure data directory exists
  const dbPath = process.env.DB_PATH || "./data/portal.db";
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Initialize database
  const db = await initDb();
  await createTables(db);

  // Seed if empty
  const result = await db.all<{ count: number }>(sql`SELECT count(*) as count FROM users`);
  const count = result[0]?.count ?? 0;

  if (count === 0) {
    await seed(db);
    console.log("Database seeded with initial data");
  }

  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
