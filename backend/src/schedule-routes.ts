import { Hono } from "hono";
import { eq, and, gte, lte } from "drizzle-orm";
import { getDb } from "./db/connection.js";
import * as schema from "./db/schema.js";
import { authMiddleware } from "./middleware.js";
import type { User } from "./types.js";
import { randomUUID } from "crypto";

type Env = { Variables: { user: User } };
const schedule = new Hono<Env>();
schedule.use("/*", authMiddleware);

// Teams
schedule.get("/teams", async (c) => {
  const db = getDb();
  const user = c.get("user");

  // Get teams where user is a member
  const memberships = await db
    .select({ teamId: schema.teamMembers.teamId })
    .from(schema.teamMembers)
    .where(eq(schema.teamMembers.userId, user.id));

  const teamIds = memberships.map((m) => m.teamId);
  if (teamIds.length === 0) return c.json({ data: [] });

  const teams = [];
  for (const teamId of teamIds) {
    const team = await db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, teamId))
      .then((r) => r[0]);

    if (team) {
      const members = await db
        .select({ userId: schema.teamMembers.userId })
        .from(schema.teamMembers)
        .where(eq(schema.teamMembers.teamId, teamId));

      teams.push({ ...team, memberIds: members.map((m) => m.userId) });
    }
  }

  return c.json({ data: teams });
});

schedule.post("/teams", async (c) => {
  const db = getDb();
  const user = c.get("user");
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403);

  const { name, memberIds } = await c.req.json<{ name: string; memberIds: string[] }>();
  const now = new Date().toISOString();
  const teamId = randomUUID();

  const [team] = await db
    .insert(schema.teams)
    .values({ id: teamId, name, createdAt: now })
    .returning();

  for (const userId of memberIds) {
    await db.insert(schema.teamMembers).values({
      id: randomUUID(),
      teamId,
      userId,
    });
  }

  return c.json({ ...team, memberIds }, 201);
});

schedule.put("/teams/:id", async (c) => {
  const user = c.get("user");
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const { id } = c.req.param();
  const { name } = await c.req.json<{ name: string }>();
  const db = getDb();
  const team = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).then(r => r[0]);
  if (!team) return c.json({ error: "Not found" }, 404);
  const [updated] = await db.update(schema.teams).set({ name }).where(eq(schema.teams.id, id)).returning();
  return c.json({ data: updated });
});

schedule.delete("/teams/:id", async (c) => {
  const user = c.get("user");
  if (user.role !== "admin") return c.json({ error: "Forbidden" }, 403);
  const { id } = c.req.param();
  const db = getDb();
  const team = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).then(r => r[0]);
  if (!team) return c.json({ error: "Not found" }, 404);
  await db.delete(schema.teams).where(eq(schema.teams.id, id));
  return c.body(null, 204);
});

// Events
schedule.get("/events", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const teamId = c.req.query("teamId");
  const start = c.req.query("start");
  const end = c.req.query("end");

  if (!teamId) return c.json({ error: "teamId is required" }, 400);

  // M-4: Verify the requesting user is a member of the team (admins bypass)
  if (user.role !== "admin") {
    const membership = await db
      .select()
      .from(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, user.id),
        ),
      )
      .then((r) => r[0]);

    if (!membership) return c.json({ error: "Forbidden" }, 403);
  }

  const conditions = [eq(schema.scheduleEvents.teamId, teamId)];
  if (start && end) {
    conditions.push(gte(schema.scheduleEvents.startAt, start));
    conditions.push(lte(schema.scheduleEvents.startAt, end));
  }

  const data = await db
    .select()
    .from(schema.scheduleEvents)
    .where(and(...conditions))
    .orderBy(schema.scheduleEvents.startAt);

  return c.json({ data });
});

schedule.post("/events", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const { title, description, startAt, endAt, teamId, allDay } = await c.req.json<{
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    teamId: string;
    allDay?: boolean;
  }>();
  const now = new Date().toISOString();

  const [event] = await db
    .insert(schema.scheduleEvents)
    .values({
      id: randomUUID(),
      title,
      description: description || "",
      startAt,
      endAt,
      teamId,
      createdBy: user.id,
      allDay: allDay || false,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return c.json(event, 201);
});

schedule.put("/events/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const eventId = c.req.param("id");

  // M-2: Fetch event and check ownership
  const existing = await db
    .select()
    .from(schema.scheduleEvents)
    .where(eq(schema.scheduleEvents.id, eventId))
    .then((r) => r[0]);
  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.createdBy !== user.id && user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  const { title, description, startAt, endAt, allDay } = await c.req.json<{
    title: string;
    description?: string;
    startAt: string;
    endAt: string;
    allDay?: boolean;
  }>();

  const [event] = await db
    .update(schema.scheduleEvents)
    .set({ title, description, startAt, endAt, allDay, updatedAt: new Date().toISOString() })
    .where(eq(schema.scheduleEvents.id, eventId))
    .returning();
  return c.json(event);
});

schedule.delete("/events/:id", async (c) => {
  const db = getDb();
  const user = c.get("user");
  const eventId = c.req.param("id");

  // M-2: Fetch event and check ownership
  const existing = await db
    .select()
    .from(schema.scheduleEvents)
    .where(eq(schema.scheduleEvents.id, eventId))
    .then((r) => r[0]);
  if (!existing) return c.json({ error: "Not found" }, 404);
  if (existing.createdBy !== user.id && user.role !== "admin") {
    return c.json({ error: "Forbidden" }, 403);
  }

  await db.delete(schema.scheduleEvents).where(eq(schema.scheduleEvents.id, eventId));
  return c.json({ success: true });
});

export { schedule };
