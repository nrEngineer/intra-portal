import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createAnnouncementRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  // UC-1: List announcements
  app.get("/", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    const result = await container.listAnnouncementsUseCase.execute(
      uow,
      {
        user,
        drafts: c.req.query("drafts"),
        category: c.req.query("category"),
        search: c.req.query("search"),
        page: c.req.query("page"),
      },
    );
    return c.json(result);
  });

  // Unread count
  app.get("/unread-count", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    const result = await container.getUnreadCountUseCase.execute(uow, user.id);
    return c.json(result);
  });

  // Upload validation
  app.post("/upload-validate", adminOnly, async (c) => {
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
  app.get("/:id", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    const result = await container.getAnnouncementUseCase.execute(uow, c.req.param("id"), user);
    return c.json(result);
  });

  // UC-3: Create announcement
  app.post("/", adminOnly, async (c) => {
    const user = c.get("user");
    const { title, body, category, status, pinned } = await c.req.json<{
      title: string;
      body: string;
      category: string;
      status: string;
      pinned: boolean;
    }>();
    const uow = container.createUnitOfWork();
    const result = await container.createAnnouncementUseCase.execute(
      uow,
      { title, body, category, status, pinned, userId: user.id },
    );
    return c.json(result, 201);
  });

  // UC-4: Update announcement
  app.put("/:id", adminOnly, async (c) => {
    const { title, body, category, status, pinned } = await c.req.json<
      Partial<{ title: string; body: string; category: string; status: string; pinned: boolean }>
    >();
    const uow = container.createUnitOfWork();
    const result = await container.updateAnnouncementUseCase.execute(
      uow,
      c.req.param("id"),
      { title, body, category, status, pinned },
    );
    return c.json(result);
  });

  // UC-5: Delete announcement
  app.delete("/:id", adminOnly, async (c) => {
    const uow = container.createUnitOfWork();
    await container.deleteAnnouncementUseCase.execute(uow, c.req.param("id"));
    return c.json({ success: true });
  });

  return app;
}
