import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/gif",
  "text/plain",
  "text/csv",
];

export function createUploadRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  app.post("/", async (c) => {
    const body = await c.req.parseBody();
    const file = body["file"];

    if (!file || !(file instanceof File)) {
      return c.json({ error: "ファイルが指定されていません" }, 400);
    }

    if (file.size > MAX_FILE_SIZE) {
      return c.json({ error: "ファイルサイズが10MBを超えています" }, 400);
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return c.json({ error: "許可されていないファイル形式です" }, 400);
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await container.storageService.upload(buffer, file.name, file.type);

    return c.json({
      key: result.key,
      url: result.url,
      filename: file.name,
      size: file.size,
      contentType: file.type,
    });
  });

  app.delete("/:key{.+}", adminOnly, async (c) => {
    const key = c.req.param("key");
    await container.storageService.delete(key);
    return c.json({ success: true });
  });

  return app;
}
