import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { handleDomainError } from "../error-mapper.js";
import { adminOnly, editorOrAdmin } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createDocumentRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  // Folders
  app.get("/folders", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.listFoldersUseCase.execute(
        c.req.query("parentId") || null,
        uow,
      );
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.post("/folders", editorOrAdmin, async (c) => {
    try {
      const user = c.get("user");
      const { name, parentId } = await c.req.json<{ name: string; parentId?: string }>();
      const uow = container.createUnitOfWork();
      const folder = await container.createFolderUseCase.execute(
        { name, parentId: parentId || null, userId: user.id },
        uow,
      );
      return c.json(folder, 201);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.put("/folders/:id", editorOrAdmin, async (c) => {
    try {
      const { name } = await c.req.json<{ name: string }>();
      const uow = container.createUnitOfWork();
      const folder = await container.updateFolderUseCase.execute(c.req.param("id"), name, uow);
      return c.json({ data: folder });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.delete("/folders/:id", adminOnly, async (c) => {
    try {
      const uow = container.createUnitOfWork();
      await container.deleteFolderUseCase.execute(c.req.param("id"), uow);
      return c.json({ success: true });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  // Documents
  app.get("/", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.listDocumentsUseCase.execute(
        c.req.query("folderId"),
        c.req.query("search"),
        uow,
      );
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.get("/:id/versions", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.getVersionHistoryUseCase.execute(c.req.param("id"), uow);
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.get("/:id", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      // ListDocumentsUseCase doesn't have a getById, so we find by searching the repo directly
      // We need to use the uow to get the document
      const doc = await uow.documentRepo.findDocumentById(c.req.param("id"));
      if (!doc) return c.json({ error: "Not found" }, 404);
      return c.json(doc);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.post("/", editorOrAdmin, async (c) => {
    try {
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
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.put("/:id", editorOrAdmin, async (c) => {
    try {
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
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.delete("/:id", adminOnly, async (c) => {
    try {
      const uow = container.createUnitOfWork();
      await container.deleteDocumentUseCase.execute(c.req.param("id"), uow);
      return c.json({ success: true });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  return app;
}
