import { eq, desc, and, like, or, sql } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import type { User, Category, AnnouncementStatus } from "../types.js";
import { randomUUID } from "crypto";

interface ListQuery {
  drafts?: string;
  category?: string;
  search?: string;
  page?: string;
}

export class AnnouncementService {
  static async list(user: User, query: ListQuery) {
    const db = getDb();
    const page = parseInt(query.page || "1", 10);
    const limit = 10;

    const conditions = [];

    if (!(user.role === "admin" && query.drafts === "true")) {
      conditions.push(eq(schema.announcements.status, "published"));
    }
    if (query.category) {
      conditions.push(eq(schema.announcements.category, query.category));
    }
    if (query.search) {
      const q = `%${query.search.toLowerCase()}%`;
      conditions.push(
        or(
          like(sql`lower(${schema.announcements.title})`, q),
          like(sql`lower(${schema.announcements.body})`, q),
        )!,
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(schema.announcements)
      .where(where)
      .then((r) => r[0].count);

    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const data = await db
      .select()
      .from(schema.announcements)
      .where(where)
      .orderBy(desc(schema.announcements.pinned), desc(schema.announcements.createdAt))
      .limit(limit)
      .offset(offset);

    const mapped = data.map((a) => ({ ...a, attachments: [] }));

    return { data: mapped, total, page, totalPages };
  }

  static async getUnreadCount(userId: string) {
    const db = getDb();

    const result = await db
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

  static async getById(id: string, user: User) {
    const db = getDb();

    const announcement = await db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id))
      .then((r) => r[0]);

    if (!announcement) return null;
    if (announcement.status === "draft" && user.role !== "admin") return null;

    // Mark as read
    const existing = await db
      .select()
      .from(schema.readStatuses)
      .where(and(eq(schema.readStatuses.userId, user.id), eq(schema.readStatuses.announcementId, id)))
      .then((r) => r[0]);

    if (!existing) {
      await db.insert(schema.readStatuses).values({
        id: randomUUID(),
        userId: user.id,
        announcementId: id,
        readAt: new Date().toISOString(),
      });
    }

    const attachments = await db
      .select()
      .from(schema.attachments)
      .where(eq(schema.attachments.announcementId, id));

    return { ...announcement, attachments };
  }

  static async create(
    data: { title: string; body: string; category: Category; status: AnnouncementStatus; pinned: boolean },
    userId: string,
  ) {
    const db = getDb();
    const now = new Date().toISOString();
    const id = randomUUID();

    const [announcement] = await db
      .insert(schema.announcements)
      .values({
        id,
        title: data.title,
        body: data.body,
        category: data.category,
        status: data.status,
        pinned: data.pinned,
        createdBy: userId,
        publishedAt: data.status === "published" ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return { ...announcement, attachments: [] };
  }

  static async update(
    id: string,
    data: Partial<{ title: string; body: string; category: Category; status: AnnouncementStatus; pinned: boolean }>,
  ) {
    const db = getDb();

    const existing = await db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id))
      .then((r) => r[0]);

    if (!existing) return null;

    const { title, body, category, status, pinned } = data;
    const updates: Record<string, unknown> = {
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(pinned !== undefined && { pinned }),
      updatedAt: new Date().toISOString(),
    };
    if (status === "published" && existing.status === "draft") {
      updates.publishedAt = new Date().toISOString();
    }

    const [updated] = await db
      .update(schema.announcements)
      .set(updates)
      .where(eq(schema.announcements.id, id))
      .returning();

    return updated;
  }

  static async delete(id: string) {
    const db = getDb();

    const existing = await db
      .select()
      .from(schema.announcements)
      .where(eq(schema.announcements.id, id))
      .then((r) => r[0]);

    if (!existing) return false;

    await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
    return true;
  }

  static validateUpload(body: { fileCount: number; fileSizes: number[] }) {
    const MAX_FILES = 2;
    const MAX_SIZE = 10 * 1024 * 1024;

    if (body.fileCount > MAX_FILES) {
      return `添付ファイルは最大${MAX_FILES}個までです`;
    }
    for (const size of body.fileSizes) {
      if (size > MAX_SIZE) {
        return "ファイルサイズは10MBまでです";
      }
    }
    return null;
  }
}
