import { Hono } from "hono";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { HonoEnv, Category, AnnouncementStatus } from "./types.js";
import { AnnouncementService } from "./services/announcement.service.js";

const api = new Hono<HonoEnv>();

api.use("/*", authMiddleware);

// UC-1: List announcements
api.get("/", async (c) => {
  const user = c.get("user");
  const result = await AnnouncementService.list(user, {
    drafts: c.req.query("drafts"),
    category: c.req.query("category"),
    search: c.req.query("search"),
    page: c.req.query("page"),
  });
  return c.json(result);
});

// Unread count
api.get("/unread-count", async (c) => {
  const user = c.get("user");
  const count = await AnnouncementService.getUnreadCount(user.id);
  return c.json({ count });
});

// Upload validation
api.post("/upload-validate", adminOnly, async (c) => {
  const body = await c.req.json<{ fileCount: number; fileSizes: number[] }>();
  const error = AnnouncementService.validateUpload(body);
  if (error) return c.json({ error }, 400);
  return c.json({ valid: true });
});

// UC-2: Get announcement detail + mark as read
api.get("/:id", async (c) => {
  const user = c.get("user");
  const result = await AnnouncementService.getById(c.req.param("id"), user);
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

// UC-3: Create announcement
api.post("/", adminOnly, async (c) => {
  const user = c.get("user");
  const { title, body, category, status, pinned } = await c.req.json<{
    title: string;
    body: string;
    category: Category;
    status: AnnouncementStatus;
    pinned: boolean;
  }>();
  const result = await AnnouncementService.create({ title, body, category, status, pinned }, user.id);
  return c.json(result, 201);
});

// UC-4: Update announcement
api.put("/:id", adminOnly, async (c) => {
  const { title, body, category, status, pinned } = await c.req.json<
    Partial<{ title: string; body: string; category: Category; status: AnnouncementStatus; pinned: boolean }>
  >();
  const result = await AnnouncementService.update(c.req.param("id"), { title, body, category, status, pinned });
  if (!result) return c.json({ error: "Not found" }, 404);
  return c.json(result);
});

// UC-5: Delete announcement
api.delete("/:id", adminOnly, async (c) => {
  const deleted = await AnnouncementService.delete(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export { api };
