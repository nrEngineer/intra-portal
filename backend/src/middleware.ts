import { createMiddleware } from "hono/factory";
import { verifyAccessToken } from "./auth-utils.js";
import type { HonoEnv, UserRole } from "./types.js";

export const authMiddleware = createMiddleware<HonoEnv>(async (c, next) => {
  // Try JWT Bearer token first
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const payload = verifyAccessToken(token);
    if (payload) {
      c.set("user", { id: payload.userId, name: payload.userId, role: payload.role });
      return next();
    }
  }

  // Fall back to header-based auth (dev/test only)
  if (process.env.NODE_ENV !== "production") {
    const userId = c.req.header("x-user-id");
    const userRole = c.req.header("x-user-role");
    if (userId && userRole) {
      const validRoles: UserRole[] = ["admin", "editor", "member"];
      if (!validRoles.includes(userRole as UserRole)) {
        return c.json({ error: "Unauthorized" }, 401);
      }
      c.set("user", { id: userId, name: userId, role: userRole as UserRole });
      return next();
    }
  }

  return c.json({ error: "Unauthorized" }, 401);
});

export const adminOnly = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});

export const editorOrAdmin = createMiddleware<HonoEnv>(async (c, next) => {
  const user = c.get("user");
  if (user.role !== "admin" && user.role !== "editor") {
    return c.json({ error: "Forbidden" }, 403);
  }
  await next();
});
