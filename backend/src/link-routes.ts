import { Hono } from "hono";
import { eq, asc } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { authMiddleware, editorOrAdmin } from "./middleware.js";
import type { User } from "./types.js";
import { randomUUID } from "crypto";

type Env = { Variables: { user: User } };
const links = new Hono<Env>();
links.use("/*", authMiddleware);

links.get("/", async (c) => {
  const db = getDb();
  const category = c.req.query("category");

  let data;
  if (category) {
    data = await db
      .select()
      .from(schema.internalLinks)
      .where(eq(schema.internalLinks.category, category))
      .orderBy(asc(schema.internalLinks.sortOrder));
  } else {
    data = await db
      .select()
      .from(schema.internalLinks)
      .orderBy(asc(schema.internalLinks.sortOrder));
  }

  return c.json({ data });
});

links.get("/categories", async (c) => {
  const db = getDb();
  const all = await db
    .select({ category: schema.internalLinks.category })
    .from(schema.internalLinks);
  const categories = [...new Set(all.map((l) => l.category))];
  return c.json({ data: categories });
});

links.post("/", editorOrAdmin, async (c) => {
  const db = getDb();
  const user = c.get("user");
  const { title, url, description, category, sortOrder } = await c.req.json<{
    title: string;
    url: string;
    description?: string;
    category: string;
    sortOrder?: number;
  }>();
  const now = new Date().toISOString();

  const [link] = await db
    .insert(schema.internalLinks)
    .values({
      id: randomUUID(),
      title,
      url,
      description: description || "",
      category,
      sortOrder: sortOrder || 0,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(link, 201);
});

links.put("/:id", editorOrAdmin, async (c) => {
  const db = getDb();
  const { title, url, description, category } = await c.req.json<{
    title: string;
    url: string;
    description?: string;
    category: string;
  }>();
  const [link] = await db
    .update(schema.internalLinks)
    .set({ title, url, description, category, updatedAt: new Date().toISOString() })
    .where(eq(schema.internalLinks.id, c.req.param("id")))
    .returning();
  if (!link) return c.json({ error: "Not found" }, 404);
  return c.json(link);
});

links.delete("/:id", editorOrAdmin, async (c) => {
  const db = getDb();
  const existing = await db
    .select()
    .from(schema.internalLinks)
    .where(eq(schema.internalLinks.id, c.req.param("id")))
    .then((r) => r[0]);
  if (!existing) return c.json({ error: "Not found" }, 404);
  await db.delete(schema.internalLinks).where(eq(schema.internalLinks.id, c.req.param("id")));
  return c.json({ success: true });
});

export { links };
