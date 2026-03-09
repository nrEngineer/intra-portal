import { eq, desc, and, like, or, sql } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type {
  AnnouncementRepository,
  AnnouncementRow,
  AnnouncementListQuery,
} from "../../application/ports/repositories/announcement.repository.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleAnnouncementRepository implements AnnouncementRepository {
  constructor(private readonly db: AppDatabase) {}

  async findAll(query: AnnouncementListQuery): Promise<{ data: AnnouncementRow[]; total: number }> {
    const { showDrafts, category, search, page, limit } = query;
    const conditions = [];

    if (!showDrafts) {
      conditions.push(eq(schema.announcements.status, "published"));
    }
    if (category) {
      conditions.push(eq(schema.announcements.category, category));
    }
    if (search) {
      const q = `%${search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${schema.announcements.title})`, q),
          like(sql`lower(${schema.announcements.body})`, q),
        )!,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const total = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.announcements)
      .where(where)
      .then((r) => r[0].count);

    const offset = (page - 1) * limit;

    const data = await this.db
      .select()
      .from(schema.announcements)
      .where(where)
      .orderBy(desc(schema.announcements.pinned), desc(schema.announcements.createdAt))
      .limit(limit)
      .offset(offset);

    return { data, total };
  }

  async findById(id: string): Promise<AnnouncementRow | null> {
    const result = await this.db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id));
    return result[0] ?? null;
  }

  async create(data: {
    id: string;
    title: string;
    body: string;
    category: string;
    status: string;
    pinned: boolean;
    createdBy: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }): Promise<AnnouncementRow> {
    const [announcement] = await this.db
      .insert(schema.announcements)
      .values({
        id: data.id,
        title: data.title,
        body: data.body,
        category: data.category,
        status: data.status as "draft" | "published",
        pinned: data.pinned,
        createdBy: data.createdBy,
        publishedAt: data.publishedAt,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return announcement;
  }

  async update(id: string, data: Record<string, unknown>): Promise<AnnouncementRow | null> {
    const existing = await this.db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id))
      .then((r) => r[0]);

    if (!existing) return null;

    const [updated] = await this.db
      .update(schema.announcements)
      .set(data)
      .where(eq(schema.announcements.id, id))
      .returning();

    return updated ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id))
      .then((r) => r[0]);

    if (!existing) return false;

    await this.db
      .delete(schema.announcements)
      .where(eq(schema.announcements.id, id));

    return true;
  }

  async getAttachments(announcementId: string): Promise<Array<{
    id: string;
    announcementId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>> {
    return this.db
      .select()
      .from(schema.attachments)
      .where(eq(schema.attachments.announcementId, announcementId));
  }

  async getUnreadCount(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(schema.announcements)
      .where(
        and(
          eq(schema.announcements.status, "published"),
          sql`${schema.announcements.id} NOT IN (
            SELECT ${schema.readStatuses.announcementId}
            FROM ${schema.readStatuses}
            WHERE ${schema.readStatuses.userId} = ${userId}
          )`,
        ),
      )
      .then((r) => r[0].count);

    return result;
  }

  async isRead(userId: string, announcementId: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.readStatuses)
      .where(
        and(
          eq(schema.readStatuses.userId, userId),
          eq(schema.readStatuses.announcementId, announcementId),
        ),
      )
      .then((r) => r[0]);

    return !!existing;
  }

  async markAsRead(data: {
    id: string;
    userId: string;
    announcementId: string;
    readAt: string;
  }): Promise<void> {
    await this.db.insert(schema.readStatuses).values({
      id: data.id,
      userId: data.userId,
      announcementId: data.announcementId,
      readAt: data.readAt,
    });
  }
}
