import { Hono } from "hono";
import { authMiddleware, editorOrAdmin, adminOnly } from "./middleware.js";
import type { HonoEnv } from "./types.js";
import { DocumentService } from "./services/document.service.js";

const docs = new Hono<HonoEnv>();
docs.use("/*", authMiddleware);

// Folders
docs.get("/folders", async (c) => {
  const data = await DocumentService.listFolders(c.req.query("parentId") || null);
  return c.json({ data });
});

docs.post("/folders", editorOrAdmin, async (c) => {
  const user = c.get("user");
  const { name, parentId } = await c.req.json<{ name: string; parentId?: string }>();
  const folder = await DocumentService.createFolder(name, parentId || null, user.id);
  return c.json(folder, 201);
});

docs.put("/folders/:id", editorOrAdmin, async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  const folder = await DocumentService.updateFolder(c.req.param("id"), name);
  if (!folder) return c.json({ error: "Not found" }, 404);
  return c.json({ data: folder });
});

docs.delete("/folders/:id", adminOnly, async (c) => {
  const result = await DocumentService.deleteFolder(c.req.param("id"));
  if ("error" in result) return c.json({ error: result.error }, result.status);
  return c.json({ success: true });
});

// Documents
docs.get("/", async (c) => {
  const data = await DocumentService.listDocuments(c.req.query("folderId"), c.req.query("search"));
  return c.json({ data });
});

docs.get("/:id", async (c) => {
  const doc = await DocumentService.getDocument(c.req.param("id"));
  if (!doc) return c.json({ error: "Not found" }, 404);
  return c.json(doc);
});

docs.get("/:id/versions", async (c) => {
  const data = await DocumentService.getVersions(c.req.param("id"));
  return c.json({ data });
});

docs.post("/", editorOrAdmin, async (c) => {
  const user = c.get("user");
  const { title, folderId, fileUrl, fileName, fileSize } = await c.req.json<{
    title: string;
    folderId?: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
  }>();
  const doc = await DocumentService.createDocument({ title, folderId, fileUrl, fileName, fileSize }, user.id);
  return c.json(doc, 201);
});

docs.put("/:id", editorOrAdmin, async (c) => {
  const user = c.get("user");
  const { title, fileUrl, fileName, fileSize } = await c.req.json<{
    title: string;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
  }>();
  const doc = await DocumentService.updateDocument(c.req.param("id"), { title, fileUrl, fileName, fileSize }, user.id);
  if (!doc) return c.json({ error: "Not found" }, 404);
  return c.json(doc);
});

docs.delete("/:id", adminOnly, async (c) => {
  const deleted = await DocumentService.deleteDocument(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export { docs };
