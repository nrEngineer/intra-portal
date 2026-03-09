import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import type { User } from "../types.js";
import { randomUUID } from "crypto";

export class ScheduleService {
  /** Get teams for a user — batch query (N+1 fixed) */
  static async getTeams(userId: string) {
    const db = getDb();

    const memberships = await db
      .select({ teamId: schema.teamMembers.teamId })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.userId, userId));

    const teamIds = memberships.map((m) => m.teamId);
    if (teamIds.length === 0) return [];

    // Batch fetch: 1 query for teams, 1 query for all members
    const teamRows = await db
      .select()
      .from(schema.teams)
      .where(inArray(schema.teams.id, teamIds));

    const allMembers = await db
      .select({ teamId: schema.teamMembers.teamId, userId: schema.teamMembers.userId })
      .from(schema.teamMembers)
      .where(inArray(schema.teamMembers.teamId, teamIds));

    // Group members by teamId
    const memberMap = new Map<string, string[]>();
    for (const m of allMembers) {
      const list = memberMap.get(m.teamId) ?? [];
      list.push(m.userId);
      memberMap.set(m.teamId, list);
    }

    return teamRows.map((team) => ({
      ...team,
      memberIds: memberMap.get(team.id) ?? [],
    }));
  }

  static async createTeam(name: string, memberIds: string[]) {
    const db = getDb();
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

    return { ...team, memberIds };
  }

  static async updateTeam(id: string, name: string) {
    const db = getDb();
    const team = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).then((r) => r[0]);
    if (!team) return null;
    const [updated] = await db.update(schema.teams).set({ name }).where(eq(schema.teams.id, id)).returning();
    return updated;
  }

  static async deleteTeam(id: string) {
    const db = getDb();
    const team = await db.select().from(schema.teams).where(eq(schema.teams.id, id)).then((r) => r[0]);
    if (!team) return false;
    await db.delete(schema.teams).where(eq(schema.teams.id, id));
    return true;
  }

  static async getEvents(teamId: string, start: string | undefined, end: string | undefined, user: User) {
    const db = getDb();

    // Verify membership (admins bypass)
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

      if (!membership) return { error: "Forbidden", status: 403 as const };
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

    return { data };
  }

  static async createEvent(
    data: { title: string; description?: string; startAt: string; endAt: string; teamId: string; allDay?: boolean },
    userId: string,
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    const [event] = await db
      .insert(schema.scheduleEvents)
      .values({
        id: randomUUID(),
        title: data.title,
        description: data.description || "",
        startAt: data.startAt,
        endAt: data.endAt,
        teamId: data.teamId,
        createdBy: userId,
        allDay: data.allDay || false,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return event;
  }

  static async updateEvent(
    eventId: string,
    data: { title: string; description?: string; startAt: string; endAt: string; allDay?: boolean },
    user: User,
  ) {
    const db = getDb();

    const existing = await db
      .select()
      .from(schema.scheduleEvents)
      .where(eq(schema.scheduleEvents.id, eventId))
      .then((r) => r[0]);

    if (!existing) return { error: "Not found", status: 404 as const };
    if (existing.createdBy !== user.id && user.role !== "admin") {
      return { error: "Forbidden", status: 403 as const };
    }

    const [event] = await db
      .update(schema.scheduleEvents)
      .set({
        title: data.title,
        description: data.description,
        startAt: data.startAt,
        endAt: data.endAt,
        allDay: data.allDay,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.scheduleEvents.id, eventId))
      .returning();

    return { data: event };
  }

  static async deleteEvent(eventId: string, user: User) {
    const db = getDb();

    const existing = await db
      .select()
      .from(schema.scheduleEvents)
      .where(eq(schema.scheduleEvents.id, eventId))
      .then((r) => r[0]);

    if (!existing) return { error: "Not found", status: 404 as const };
    if (existing.createdBy !== user.id && user.role !== "admin") {
      return { error: "Forbidden", status: 403 as const };
    }

    await db.delete(schema.scheduleEvents).where(eq(schema.scheduleEvents.id, eventId));
    return { success: true };
  }
}
