import { Hono } from "hono";
import type { MiddlewareHandler } from "hono";
import type { Container } from "../../../di/container.js";
import { adminOnly } from "../middleware/auth.middleware.js";
import type { HonoEnv } from "../middleware/auth.middleware.js";

export function createScheduleRoutes(container: Container, authMiddleware: MiddlewareHandler) {
  const app = new Hono<HonoEnv>();

  app.use("/*", authMiddleware);

  // Teams
  app.get("/teams", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    const data = await container.listTeamsUseCase.execute(user.id, uow);
    return c.json({ data });
  });

  app.post("/teams", adminOnly, async (c) => {
    const { name, memberIds } = await c.req.json<{ name: string; memberIds: string[] }>();
    const uow = container.createUnitOfWork();
    const team = await container.createTeamUseCase.execute({ name, memberIds }, uow);
    return c.json(team, 201);
  });

  app.put("/teams/:id", adminOnly, async (c) => {
    const { name } = await c.req.json<{ name: string }>();
    const uow = container.createUnitOfWork();
    const team = await container.updateTeamUseCase.execute(c.req.param("id"), name, uow);
    return c.json({ data: team });
  });

  app.delete("/teams/:id", adminOnly, async (c) => {
    const uow = container.createUnitOfWork();
    await container.deleteTeamUseCase.execute(c.req.param("id"), uow);
    return c.body(null, 204);
  });

  // Events
  app.get("/events", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    const result = await container.listEventsUseCase.execute(
      c.req.query("teamId"),
      c.req.query("start"),
      c.req.query("end"),
      user,
      uow,
    );
    return c.json(result);
  });

  app.post("/events", async (c) => {
    const user = c.get("user");
    const { title, description, startAt, endAt, teamId, allDay } = await c.req.json<{
      title: string;
      description?: string;
      startAt: string;
      endAt: string;
      teamId: string;
      allDay?: boolean;
    }>();
    const uow = container.createUnitOfWork();
    const event = await container.createEventUseCase.execute(
      { title, description, startAt, endAt, teamId, allDay, userId: user.id },
      uow,
    );
    return c.json(event, 201);
  });

  app.put("/events/:id", async (c) => {
    const user = c.get("user");
    const { title, description, startAt, endAt, allDay } = await c.req.json<{
      title: string;
      description?: string;
      startAt: string;
      endAt: string;
      allDay?: boolean;
    }>();
    const uow = container.createUnitOfWork();
    const result = await container.updateEventUseCase.execute(
      c.req.param("id"),
      { title, description, startAt, endAt, allDay },
      user,
      uow,
    );
    return c.json(result);
  });

  app.delete("/events/:id", async (c) => {
    const user = c.get("user");
    const uow = container.createUnitOfWork();
    await container.deleteEventUseCase.execute(c.req.param("id"), user, uow);
    return c.json({ success: true });
  });

  return app;
}
