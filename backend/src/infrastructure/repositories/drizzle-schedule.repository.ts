import { eq, and, gte, lte, inArray } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../db/schema.js";
import type {
  ScheduleRepository,
  TeamRow,
} from "../../application/ports/repositories/schedule.repository.js";
import type { ScheduleEvent } from "../../domain/models/schedule.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleScheduleRepository implements ScheduleRepository {
  constructor(private readonly db: AppDatabase) {}

  // Teams

  async findTeamsByUserId(userId: string): Promise<Array<TeamRow & { memberIds: string[] }>> {
    const memberships = await this.db
      .select({ teamId: schema.teamMembers.teamId })
      .from(schema.teamMembers)
      .where(eq(schema.teamMembers.userId, userId));

    const teamIds = memberships.map((m) => m.teamId);
    if (teamIds.length === 0) return [];

    const teamRows = await this.db
      .select()
      .from(schema.teams)
      .where(inArray(schema.teams.id, teamIds));

    const allMembers = await this.db
      .select({ teamId: schema.teamMembers.teamId, userId: schema.teamMembers.userId })
      .from(schema.teamMembers)
      .where(inArray(schema.teamMembers.teamId, teamIds));

    const memberMap = new Map<string, string[]>();
    for (const m of allMembers) {
      const existing = memberMap.get(m.teamId);
      memberMap.set(m.teamId, existing ? [...existing, m.userId] : [m.userId]);
    }

    return teamRows.map((team) => ({
      id: team.id,
      name: team.name,
      createdAt: team.createdAt,
      memberIds: memberMap.get(team.id) ?? [],
    }));
  }

  async createTeam(data: { id: string; name: string; createdAt: string }): Promise<TeamRow> {
    const [team] = await this.db
      .insert(schema.teams)
      .values({ id: data.id, name: data.name, createdAt: data.createdAt })
      .returning();
    return { id: team.id, name: team.name, createdAt: team.createdAt };
  }

  async addTeamMembers(
    members: Array<{ id: string; teamId: string; userId: string }>,
  ): Promise<void> {
    for (const member of members) {
      await this.db.insert(schema.teamMembers).values({
        id: member.id,
        teamId: member.teamId,
        userId: member.userId,
      });
    }
  }

  async findTeamById(id: string): Promise<TeamRow | null> {
    const result = await this.db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, id));
    const team = result[0];
    if (!team) return null;
    return { id: team.id, name: team.name, createdAt: team.createdAt };
  }

  async updateTeam(id: string, name: string): Promise<TeamRow | null> {
    const existing = await this.db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, id))
      .then((r) => r[0]);
    if (!existing) return null;

    const [updated] = await this.db
      .update(schema.teams)
      .set({ name })
      .where(eq(schema.teams.id, id))
      .returning();
    return { id: updated.id, name: updated.name, createdAt: updated.createdAt };
  }

  async deleteTeam(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.teams)
      .where(eq(schema.teams.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.teams).where(eq(schema.teams.id, id));
    return true;
  }

  async isTeamMember(teamId: string, userId: string): Promise<boolean> {
    const membership = await this.db
      .select()
      .from(schema.teamMembers)
      .where(
        and(
          eq(schema.teamMembers.teamId, teamId),
          eq(schema.teamMembers.userId, userId),
        ),
      )
      .then((r) => r[0]);
    return !!membership;
  }

  // Events

  async findEvents(teamId: string, start?: string, end?: string): Promise<ScheduleEvent[]> {
    const conditions = [eq(schema.scheduleEvents.teamId, teamId)];
    if (start) {
      conditions.push(gte(schema.scheduleEvents.startAt, start));
    }
    if (end) {
      conditions.push(lte(schema.scheduleEvents.startAt, end));
    }

    const data = await this.db
      .select()
      .from(schema.scheduleEvents)
      .where(and(...conditions))
      .orderBy(schema.scheduleEvents.startAt);

    return data.map((e) => ({
      id: e.id,
      title: e.title,
      description: e.description,
      startAt: e.startAt,
      endAt: e.endAt,
      teamId: e.teamId,
      createdBy: e.createdBy,
      allDay: e.allDay,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    }));
  }

  async findEventById(id: string): Promise<ScheduleEvent | null> {
    const result = await this.db
      .select()
      .from(schema.scheduleEvents)
      .where(eq(schema.scheduleEvents.id, id));
    const e = result[0];
    if (!e) return null;
    return {
      id: e.id,
      title: e.title,
      description: e.description,
      startAt: e.startAt,
      endAt: e.endAt,
      teamId: e.teamId,
      createdBy: e.createdBy,
      allDay: e.allDay,
      createdAt: e.createdAt,
      updatedAt: e.updatedAt,
    };
  }

  async createEvent(data: ScheduleEvent): Promise<ScheduleEvent> {
    const [event] = await this.db
      .insert(schema.scheduleEvents)
      .values({
        id: data.id,
        title: data.title,
        description: data.description,
        startAt: data.startAt,
        endAt: data.endAt,
        teamId: data.teamId,
        createdBy: data.createdBy,
        allDay: data.allDay,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      teamId: event.teamId,
      createdBy: event.createdBy,
      allDay: event.allDay,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async updateEvent(id: string, data: Partial<ScheduleEvent>): Promise<ScheduleEvent | null> {
    const existing = await this.db
      .select()
      .from(schema.scheduleEvents)
      .where(eq(schema.scheduleEvents.id, id))
      .then((r) => r[0]);
    if (!existing) return null;

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description;
    if (data.startAt !== undefined) updates.startAt = data.startAt;
    if (data.endAt !== undefined) updates.endAt = data.endAt;
    if (data.allDay !== undefined) updates.allDay = data.allDay;
    updates.updatedAt = new Date().toISOString();

    const [event] = await this.db
      .update(schema.scheduleEvents)
      .set(updates)
      .where(eq(schema.scheduleEvents.id, id))
      .returning();

    return {
      id: event.id,
      title: event.title,
      description: event.description,
      startAt: event.startAt,
      endAt: event.endAt,
      teamId: event.teamId,
      createdBy: event.createdBy,
      allDay: event.allDay,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }

  async deleteEvent(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.scheduleEvents)
      .where(eq(schema.scheduleEvents.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.scheduleEvents).where(eq(schema.scheduleEvents.id, id));
    return true;
  }
}
