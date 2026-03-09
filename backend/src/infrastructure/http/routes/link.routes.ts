import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { editorOrAdmin } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createLinkRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  app.get("/", async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.listLinksUseCase.execute(uow, c.req.query("category"));
    return c.json({ data });
  });

  app.get("/categories", async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.listCategoriesUseCase.execute(uow);
    return c.json({ data });
  });

  app.post("/", editorOrAdmin, async (c) => {
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
      uow,
      { title, url, description, category, sortOrder, userId: user.id },
    );
    return c.json(link, 201);
  });

  app.put("/:id", editorOrAdmin, async (c) => {
    const { title, url, description, category } = await c.req.json<{
      title: string;
      url: string;
      description?: string;
      category: string;
    }>();
    const uow = container.createUnitOfWork();
    const link = await container.updateLinkUseCase.execute(
      uow,
      c.req.param("id"),
      { title, url, description, category },
    );
    return c.json(link);
  });

  app.delete("/:id", editorOrAdmin, async (c) => {
    const uow = container.createUnitOfWork();
    await container.deleteLinkUseCase.execute(uow, c.req.param("id"));
    return c.json({ success: true });
  });

  return app;
}
