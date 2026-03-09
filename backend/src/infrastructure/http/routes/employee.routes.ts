import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { handleDomainError } from "../error-mapper.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createEmployeeRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  app.get("/", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const data = await container.listEmployeesUseCase.execute(
        c.req.query("search"),
        c.req.query("department"),
        uow,
      );
      return c.json({ data });
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.post("/", adminOnly, async (c) => {
    try {
      const { userId, name, email, department, position, photoUrl, phone, joinedAt } = await c.req.json<{
        userId: string;
        name: string;
        email: string;
        department: string;
        position: string;
        photoUrl?: string;
        phone?: string;
        joinedAt: string;
      }>();
      const uow = container.createUnitOfWork();
      const emp = await container.registerEmployeeUseCase.execute(
        { userId, name, email, department, position, photoUrl, phone, joinedAt },
        uow,
      );
      return c.json(emp, 201);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.get("/:id", async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const emp = await uow.employeeRepo.findById(c.req.param("id"));
      if (!emp) return c.json({ error: "Not found" }, 404);
      return c.json(emp);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.put("/:id", adminOnly, async (c) => {
    try {
      const { name, email, department, position, phone, photoUrl, joinedAt } = await c.req.json<{
        name: string;
        email: string;
        department: string;
        position: string;
        phone?: string;
        photoUrl?: string;
        joinedAt: string;
      }>();
      const uow = container.createUnitOfWork();
      const emp = await container.updateEmployeeUseCase.execute(
        c.req.param("id"),
        { name, email, department, position, phone, photoUrl, joinedAt },
        uow,
      );
      return c.json(emp);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  app.delete("/:id", adminOnly, async (c) => {
    try {
      const uow = container.createUnitOfWork();
      const deleted = await uow.employeeRepo.delete(c.req.param("id"));
      if (!deleted) return c.json({ error: "Not found" }, 404);
      return c.body(null, 204);
    } catch (error) {
      return handleDomainError(c, error);
    }
  });

  return app;
}
