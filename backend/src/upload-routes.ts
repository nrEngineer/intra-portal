import { Hono } from "hono";
import { authMiddleware } from "./middleware.js";
import { storage } from "./lib/storage.js";

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

export const uploads = new Hono();

uploads.use("/*", authMiddleware);

uploads.post("/", async (c) => {
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
  const result = await storage.upload(buffer, file.name, file.type);

  return c.json({
    key: result.key,
    url: result.url,
    filename: file.name,
    size: file.size,
    contentType: file.type,
  });
});

uploads.delete("/:key{.+}", async (c) => {
  const key = c.req.param("key");
  await storage.delete(key);
  return c.json({ success: true });
});
