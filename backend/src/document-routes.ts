import { Hono } from "hono";
import { eq, like, or, sql, desc, isNull } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { authMiddleware } from "./middleware.js";
import type { User } from "./types.js";
import { randomUUID } from "crypto";

type Env = { Variables: { user: User } };
const docs = new Hono<Env>();
docs.use("/*", authMiddleware);

// Folders
docs.get("/folders", async (c) => {
  const db = getDb();
  const parentId = c.req.query("parentId") || null;

  const data = parentId
    ? await db.select().from(schema.folders).where(eq(schema.folders.parentId, parentId))
    : await db.select().from(schema.folders).where(isNull(schema.folders.parentId));

  return c.json({ data });
});

docs.post("/folders", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const { name, parentId } = await c.req.json();

  const [folder] = await db
    .insert(schema.folders)
    .values({
      id: randomUUID(),
      name,
      parentId: parentId || null,
      createdBy: user.id,
      createdAt: new Date().toISOString(),
    })
    .returning();

  return c.json(folder, 201);
});

docs.delete("/folders/:id", async (c) => {
  const db = getDb();
  const id = c.req.param("id");

  // Check for children
  const childFolders = await db
    .select()
    .from(schema.folders)
    .where(eq(schema.folders.parentId, id));
  const childDocs = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.folderId, id));

  if (childFolders.length > 0 || childDocs.length > 0) {
    return c.json({ error: "フォルダが空でないか、見つかりません" }, 400);
  }

  const existing = await db
    .select()
    .from(schema.folders)
    .where(eq(schema.folders.id, id))
    .then((r) => r[0]);

  if (!existing) {
    return c.json({ error: "フォルダが空でないか、見つかりません" }, 400);
  }

  await db.delete(schema.folders).where(eq(schema.folders.id, id));
  return c.json({ success: true });
});

// Documents
docs.get("/", async (c) => {
  const db = getDb();
  const folderId = c.req.query("folderId");
  const search = c.req.query("search");

  if (search) {
    const q = `%${search.toLowerCase()}%`;
    const data = await db
      .select()
      .from(schema.documents)
      .where(
        or(
          like(sql`lower(${schema.documents.title})`, q),
          like(sql`lower(${schema.documents.fileName})`, q),
        ),
      );
    return c.json({ data });
  }

  const data = folderId
    ? await db.select().from(schema.documents).where(eq(schema.documents.folderId, folderId))
    : await db.select().from(schema.documents).where(isNull(schema.documents.folderId));

  return c.json({ data });
});

docs.get("/:id", async (c) => {
  const db = getDb();
  const doc = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, c.req.param("id")))
    .then((r) => r[0]);
  if (!doc) return c.json({ error: "Not found" }, 404);
  return c.json(doc);
});

docs.get("/:id/versions", async (c) => {
  const db = getDb();
  const data = await db
    .select()
    .from(schema.documentVersions)
    .where(eq(schema.documentVersions.documentId, c.req.param("id")))
    .orderBy(desc(schema.documentVersions.version));
  return c.json({ data });
});

docs.post("/", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const body = await c.req.json();
  const now = new Date().toISOString();
  const docId = randomUUID();

  const [doc] = await db
    .insert(schema.documents)
    .values({
      id: docId,
      title: body.title,
      folderId: body.folderId || null,
      fileUrl: body.fileUrl,
      fileName: body.fileName,
      fileSize: body.fileSize,
      version: 1,
      createdBy: user.id,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db.insert(schema.documentVersions).values({
    id: randomUUID(),
    documentId: docId,
    version: 1,
    fileUrl: body.fileUrl,
    fileName: body.fileName,
    fileSize: body.fileSize,
    createdBy: user.id,
    createdAt: now,
  });

  return c.json(doc, 201);
});

docs.put("/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const now = new Date().toISOString();

  const existing = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .then((r) => r[0]);

  if (!existing) return c.json({ error: "Not found" }, 404);

  const isNewFile = body.fileUrl && body.fileUrl !== existing.fileUrl;
  const newVersion = isNewFile ? existing.version + 1 : existing.version;

  if (isNewFile) {
    await db.insert(schema.documentVersions).values({
      id: randomUUID(),
      documentId: id,
      version: newVersion,
      fileUrl: body.fileUrl,
      fileName: body.fileName || existing.fileName,
      fileSize: body.fileSize || existing.fileSize,
      createdBy: user.id,
      createdAt: now,
    });
  }

  const [doc] = await db
    .update(schema.documents)
    .set({
      ...body,
      version: newVersion,
      updatedAt: now,
    })
    .where(eq(schema.documents.id, id))
    .returning();

  return c.json(doc);
});

docs.delete("/:id", async (c) => {
  const db = getDb();
  const id = c.req.param("id");

  const existing = await db
    .select()
    .from(schema.documents)
    .where(eq(schema.documents.id, id))
    .then((r) => r[0]);

  if (!existing) return c.json({ error: "Not found" }, 404);

  await db.delete(schema.documentVersions).where(eq(schema.documentVersions.documentId, id));
  await db.delete(schema.documents).where(eq(schema.documents.id, id));
  return c.json({ success: true });
});

export { docs };
