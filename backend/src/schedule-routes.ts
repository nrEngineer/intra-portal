import { Hono } from "hono";
import { authMiddleware, adminOnly } from "./middleware.js";
import type { HonoEnv } from "./types.js";
import { ScheduleService } from "./services/schedule.service.js";

const schedule = new Hono<HonoEnv>();
schedule.use("/*", authMiddleware);

// Teams
schedule.get("/teams", async (c) => {
  const user = c.get("user");
  const data = await ScheduleService.getTeams(user.id);
  return c.json({ data });
});

schedule.post("/teams", adminOnly, async (c) => {
  const { name, memberIds } = await c.req.json<{ name: string; memberIds: string[] }>();
  const team = await ScheduleService.createTeam(name, memberIds);
  return c.json(team, 201);
});

schedule.put("/teams/:id", adminOnly, async (c) => {
  const { name } = await c.req.json<{ name: string }>();
  const team = await ScheduleService.updateTeam(c.req.param("id"), name);
  if (!team) return c.json({ error: "Not found" }, 404);
  return c.json({ data: team });
});

schedule.delete("/teams/:id", adminOnly, async (c) => {
  const deleted = await ScheduleService.deleteTeam(c.req.param("id"));
  if (!deleted) return c.json({ error: "Not found" }, 404);
  return c.body(null, 204);
});

// Events
schedule.get("/events", async (c) => {
  const user = c.get("user");
  const teamId = c.req.query("teamId");
  if (!teamId) return c.json({ error: "teamId is required" }, 400);

  const result = await ScheduleService.getEvents(teamId, c.req.query("start"), c.req.query("end"), user);
  if ("error" in result) return c.json({ error: result.error }, result.status);
  return c.json(result);
});

schedule.post("/events", async (c) => {
  const user = c.get("user");
  const { title, description, startAt, endAt, teamId, allDay } = await c.req.json<{
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    teamId: string;
    allDay?: boolean;
  }>();
  const event = await ScheduleService.createEvent({ title, description, startAt, endAt, teamId, allDay }, user.id);
  return c.json(event, 201);
});

schedule.put("/events/:id", async (c) => {
  const user = c.get("user");
  const { title, description, startAt, endAt, allDay } = await c.req.json<{
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    allDay?: boolean;
  }>();
  const result = await ScheduleService.updateEvent(c.req.param("id"), { title, description, startAt, endAt, allDay }, user);
  if ("error" in result) return c.json({ error: result.error }, result.status);
  return c.json(result.data);
});

schedule.delete("/events/:id", async (c) => {
  const user = c.get("user");
  const result = await ScheduleService.deleteEvent(c.req.param("id"), user);
  if ("error" in result) return c.json({ error: result.error }, result.status);
  return c.json({ success: true });
});

export { schedule };
