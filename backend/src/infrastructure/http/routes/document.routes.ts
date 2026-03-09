import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { adminOnly, editorOrAdmin } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createDocumentRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  // Folders
  app.get("/folders", async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.listFoldersUseCase.execute(
      c.req.query("parentId") || null,
      uow,
    );
    return c.json({ data });
  });

  app.post("/folders", editorOrAdmin, async (c) => {
    const user = c.get("user");
    const { name, parentId } = await c.req.json<{ name: string; parentId?: string }>();
    const uow = container.createUnitOfWork();
    const folder = await container.createFolderUseCase.execute(
      { name, parentId: parentId || null, userId: user.id },
      uow,
    );
    return c.json(folder, 201);
  });

  app.put("/folders/:id", editorOrAdmin, async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    const uow = container.createUnitOfWork();
    const folder = await container.updateFolderUseCase.execute(c.req.param("id"), name, uow);
    return c.json({ data: folder });
  });

  app.delete("/folders/:id", adminOnly, async (c) => {
    const uow = container.createUnitOfWork();
    await container.deleteFolderUseCase.execute(c.req.param("id"), uow);
    return c.json({ success: true });
  });

  // Documents
  app.get("/", async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.listDocumentsUseCase.execute(
      c.req.query("folderId"),
      c.req.query("search"),
      uow,
    );
    return c.json({ data });
  });

  app.get("/:id/versions", async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.getVersionHistoryUseCase.execute(c.req.param("id"), uow);
    return c.json({ data });
  });

  app.get("/:id", async (c) => {
    const uow = container.createUnitOfWork();
    // ListDocumentsUseCase doesn't have a getById, so we find by searching the repo directly
    // We need to use the uow to get the document
    const doc = await uow.documentRepo.findDocumentById(c.req.param("id"));
    if (!doc) return c.json({ error: "Not found" }, 404);
    return c.json(doc);
  });

  app.post("/", editorOrAdmin, async (c) => {
    const user = c.get("user");
    const { title, folderId, fileUrl, fileName, fileSize } = await c.req.json<{
      title: string;
      folderId?: string;
      fileUrl: string;
      fileName: string;
      fileSize: number;
    }>();
    const uow = container.createUnitOfWork();
    const doc = await container.createDocumentUseCase.execute(
      { title, folderId, fileUrl, fileName, fileSize, userId: user.id },
      uow,
    );
    return c.json(doc, 201);
  });

  app.put("/:id", editorOrAdmin, async (c) => {
    const user = c.get("user");
    const { title, fileUrl, fileName, fileSize } = await c.req.json<{
      title: string;
      fileUrl?: string;
      fileName?: string;
      fileSize?: number;
    }>();
    const uow = container.createUnitOfWork();
    const doc = await container.updateDocumentUseCase.execute(
      c.req.param("id"),
      { title, fileUrl, fileName, fileSize, userId: user.id },
      uow,
    );
    return c.json(doc);
  });

  app.delete("/:id", adminOnly, async (c) => {
    const uow = container.createUnitOfWork();
    await container.deleteDocumentUseCase.execute(c.req.param("id"), uow);
    return c.json({ success: true });
  });

  return app;
}
