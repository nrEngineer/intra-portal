import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { handleDomainError } from "../error-mapper.js";
import { editorOrAdmin } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createLinkRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  app.get("/", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.listLinksUseCase.execute(c.req.query("category"), uow);
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.get("/categories", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.listCategoriesUseCase.execute(uow);
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.post("/", editorOrAdmin, async (c) => {
    try {
      const user = c.get("user");
      const { title, url, description, category, sortOrder } = await c.req.json<{
        title: string;
        url: string;
        description?: string;
        category: string;
        sortOrder?: number;
      }>();
      const uow = container.createUnitOfWork();
      const link = await container.createLinkUseCase.execute(
        { title, url, description, category, sortOrder, userId: user.id },
        uow,
      );
      return c.json(link, 201);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.put("/:id", editorOrAdmin, async (c) => {
    try {
      const { title, url, description, category } = await c.req.json<{
        title: string;
        url: string;
        description?: string;
        category: string;
      }>();
      const uow = container.createUnitOfWork();
      const link = await container.updateLinkUseCase.execute(
        c.req.param("id"),
        { title, url, description, category },
        uow,
      );
      return c.json(link);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.delete("/:id", editorOrAdmin, async (c) => {
    try {
      const uow = container.createUnitOfWork();
      await container.deleteLinkUseCase.execute(c.req.param("id"), uow);
      return c.json({ success: true });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  return app;
}
