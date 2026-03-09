import { Hono } from "hono";
import { authMiddleware, editorOrAdmin } from "./middleware.js";
import type { HonoEnv } from "./types.js";
import { LinkService } from "./services/link.service.js";

const links = new Hono<HonoEnv>();
links.use("/*", authMiddleware);

links.get("/", async (c) => {
  const data = await LinkService.list(c.req.query("category"));
  return c.json({ data });
});

links.get("/categories", async (c) => {
  const data = await LinkService.getCategories();
  return c.json({ data });
});

links.post("/", editorOrAdmin, async (c) => {
  const user = c.get("user");
  const { title, url, description, category, sortOrder } = await c.req.json<{
    title: string;
    url: string;
    description?: string;
    category: string;
    sortOrder?: number;
  }>();
  const link = await LinkService.create({ title, url, description, category, sortOrder }, user.id);
  return c.json(link, 201);
});

links.put("/:id", editorOrAdmin, async (c) => {
  const { title, url, description, category } = await c.req.json<{
    title: string;
    url: string;
    description?: string;
    category: string;
  }>();
  const link = await LinkService.update(c.req.param("id"), { title, url, description, category });
  if (!link) return c.json({ error: "Not found" }, 404);
  return c.json(link);
});

links.delete("/:id", editorOrAdmin, async (c) => {
  const deleted = await LinkService.delete(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.json({ success: true });
});

export { links };
