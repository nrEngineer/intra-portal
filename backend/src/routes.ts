import { Hono } from "hono";
import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { User, Category, AnnouncementStatus } from "./types.js";
import { randomUUID } from "crypto";

type Env = { Variables: { user: User } };

const api = new Hono<Env>();

api.use("/*", authMiddleware);

// UC-1: List announcements
api.get("/", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const drafts = c.req.query("drafts");
  const category = c.req.query("category") as Category | undefined;
  const search = c.req.query("search");
  const page = parseInt(c.req.query("page") || "1", 10);
  const limit = 10;

  const conditions = [];

  if (!(user.role === "admin" && drafts === "true")) {
    conditions.push(eq(schema.announcements.status, "published"));
  }
  if (category) {
    conditions.push(eq(schema.announcements.category, category));
  }
  if (search) {
    const q = `%${search.toLowerCase()}%`;
    conditions.push(
      or(
        like(sql`lower(${schema.announcements.title})`, q),
        like(sql`lower(${schema.announcements.body})`, q),
      )!,
    );
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const total = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.announcements)
    .where(where)
    .then((r) => r[0].count);

  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  const data = await db
    .select()
    .from(schema.announcements)
    .where(where)
    .orderBy(desc(schema.announcements.pinned), desc(schema.announcements.createdAt))
    .limit(limit)
    .offset(offset);

  // Map pinned from number to boolean for API compatibility
  const mapped = data.map((a) => ({ ...a, attachments: [] }));

  return c.json({ data: mapped, total, page, totalPages });
});

// Unread count (must be before /:id to avoid matching)
api.get("/unread-count", async (c) => {
  const db = getDb();
  const user = c.get("user");

  const published = await db
    .select({ id: schema.announcements.id })
    .from(schema.announcements)
    .where(eq(schema.announcements.status, "published"));

  const readIds = await db
    .select({ announcementId: schema.readStatuses.announcementId })
    .from(schema.readStatuses)
    .where(eq(schema.readStatuses.userId, user.id));

  const readSet = new Set(readIds.map((r) => r.announcementId));
  const count = published.filter((a) => !readSet.has(a.id)).length;

  return c.json({ count });
});

// S-4: Upload validation
api.post("/upload-validate", adminOnly, async (c) => {
  const body = await c.req.json<{ fileCount: number; fileSizes: number[] }>();
  const MAX_FILES = 2;
  const MAX_SIZE = 10 * 1024 * 1024;

  if (body.fileCount > MAX_FILES) {
    return c.json({ error: `添付ファイルは最大${MAX_FILES}個までです` }, 400);
  }
  for (const size of body.fileSizes) {
    if (size > MAX_SIZE) {
      return c.json({ error: "ファイルサイズは10MBまでです" }, 400);
    }
  }
  return c.json({ valid: true });
});

// UC-2: Get announcement detail + mark as read
api.get("/:id", async (c) => {
  const db = getDb();
  const id = c.req.param("id");
  const user = c.get("user");

  const announcement = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id))
    .then((r) => r[0]);

  if (!announcement) {
    return c.json({ error: "Not found" }, 404);
  }
  if (announcement.status === "draft" && user.role !== "admin") {
    return c.json({ error: "Not found" }, 404);
  }

  // Mark as read
  const existing = await db
    .select()
    .from(schema.readStatuses)
    .where(and(eq(schema.readStatuses.userId, user.id), eq(schema.readStatuses.announcementId, id)))
    .then((r) => r[0]);

  if (!existing) {
    await db.insert(schema.readStatuses).values({
      id: randomUUID(),
      userId: user.id,
      announcementId: id,
      readAt: new Date().toISOString(),
    });
  }

  const attachments = await db
    .select()
    .from(schema.attachments)
    .where(eq(schema.attachments.announcementId, id));

  return c.json({ ...announcement, attachments });
});

// UC-3: Create announcement (admin only)
api.post("/", adminOnly, async (c) => {
  const db = getDb();
  const body = await c.req.json<{
    title: string;
    body: string;
    category: Category;
    status: AnnouncementStatus;
    pinned: boolean;
  }>();

  const now = new Date().toISOString();
  const user = c.get("user");
  const id = randomUUID();

  const [announcement] = await db
    .insert(schema.announcements)
    .values({
      id,
      title: body.title,
      body: body.body,
      category: body.category,
      status: body.status,
      pinned: body.pinned,
      createdBy: user.id,
      publishedAt: body.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json({ ...announcement, attachments: [] }, 201);
});

// UC-4: Update announcement (admin only)
api.put("/:id", adminOnly, async (c) => {
  const db = getDb();
  const id = c.req.param("id");
  const body = await c.req.json<
    Partial<{
      title: string;
      body: string;
      category: Category;
      status: AnnouncementStatus;
      pinned: boolean;
    }>
  >();

  const existing = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id))
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ error: "Not found" }, 404);
  }

  const updates: Record<string, unknown> = { ...body, updatedAt: new Date().toISOString() };
  if (body.status === "published" && existing.status === "draft") {
    updates.publishedAt = new Date().toISOString();
  }

  const [updated] = await db
    .update(schema.announcements)
    .set(updates)
    .where(eq(schema.announcements.id, id))
    .returning();

  return c.json(updated);
});

// UC-5: Delete announcement (admin only)
api.delete("/:id", adminOnly, async (c) => {
  const db = getDb();
  const id = c.req.param("id");

  const existing = await db
    .select()
    .from(schema.announcements)
    .where(eq(schema.announcements.id, id))
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ error: "Not found" }, 404);
  }

  await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
  return c.json({ success: true });
});

export { api };
