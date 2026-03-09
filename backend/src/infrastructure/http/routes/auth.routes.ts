import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createAuthRoutes(container: Container) {
  const auth = new Hono<HonoEnv>();

  // UC-1: Login
  auth.post("/login", async (c) => {
    const { email, password } = await c.req.json<{ email: string; password: string }>();
    const uow = container.createUnitOfWork();
    const result = await container.loginUseCase.execute(uow, { email, password });
    return c.json(result);
  });

  // UC-2: Refresh token
  auth.post("/refresh", async (c) => {
    const { refreshToken } = await c.req.json<{ refreshToken: string }>();
    const uow = container.createUnitOfWork();
    const result = await container.refreshTokenUseCase.execute(uow, refreshToken);
    return c.json(result);
  });

  // UC-3: Logout
  auth.post("/logout", async (c) => {
    const { refreshToken } = await c.req.json<{ refreshToken: string }>();
    const uow = container.createUnitOfWork();
    await container.logoutUseCase.execute(uow, refreshToken);
    return c.json({ success: true });
  });

  // UC-8: Password reset request
  auth.post("/password-reset/request", async (c) => {
    const { email } = await c.req.json<{ email: string }>();
    const uow = container.createUnitOfWork();
    await container.resetPasswordRequestUseCase.execute(uow, email);
    return c.json({ message: "リセットメールを送信しました" });
  });

  // UC-9: Password reset execute
  auth.post("/password-reset/execute", async (c) => {
    const { token, newPassword } = await c.req.json<{ token: string; newPassword: string }>();
    const uow = container.createUnitOfWork();
    await container.resetPasswordExecuteUseCase.execute(uow, token, newPassword);
    return c.json({ success: true });
  });

  return auth;
}

export function createUserRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const users = new Hono<HonoEnv>();

  users.use("/*", authMiddleware);

  // UC-5: Get my profile
  users.get("/me", async (c) => {
    const reqUser = c.get("user");
    const uow = container.createUnitOfWork();
    const profile = await container.getProfileUseCase.execute(uow, reqUser.id);
    return c.json(profile);
  });

  // UC-5: Update my profile
  users.put("/me", async (c) => {
    const reqUser = c.get("user");
    const { name } = await c.req.json<{ name: string }>();
    const uow = container.createUnitOfWork();
    const result = await container.updateProfileUseCase.execute(uow, reqUser.id, name);
    return c.json(result);
  });

  // UC-6: List users
  users.get("/", adminOnly, async (c) => {
    const uow = container.createUnitOfWork();
    const data = await container.listUsersUseCase.execute(uow);
    return c.json({ data });
  });

  // UC-4: Create user
  users.post("/", adminOnly, async (c) => {
    const body = await c.req.json<{ email: string; name: string; password: string; role: string }>();
    const uow = container.createUnitOfWork();
    const result = await container.registerUseCase.execute(uow, body);
    return c.json(result, 201);
  });

  // UC-7: Delete user
  users.delete("/:id", adminOnly, async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    await container.deleteUserUseCase.execute(uow, c.req.param("id"), user.id);
    return c.body(null, 204);
  });

  // UC-7: Change user role
  users.put("/:id/role", adminOnly, async (c) => {
    const { role } = await c.req.json<{ role: string }>();
    const uow = container.createUnitOfWork();
    const result = await container.changeRoleUseCase.execute(uow, c.req.param("id"), role);
    return c.json(result);
  });

  return users;
}
