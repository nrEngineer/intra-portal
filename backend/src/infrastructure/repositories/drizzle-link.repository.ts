import { eq, asc } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../db/schema.js";
import type { LinkRepository } from "../../application/ports/repositories/link.repository.js";
import type { InternalLink } from "../../domain/models/link.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleLinkRepository implements LinkRepository {
  constructor(private readonly db: AppDatabase) {}

  async findAll(category?: string): Promise<InternalLink[]> {
    if (category) {
      return this.db
        .select()
        .from(schema.internalLinks)
        .where(eq(schema.internalLinks.category, category))
        .orderBy(asc(schema.internalLinks.sortOrder));
    }
    return this.db
      .select()
      .from(schema.internalLinks)
      .orderBy(asc(schema.internalLinks.sortOrder));
  }

  async getCategories(): Promise<string[]> {
    const all = await this.db
      .select({ category: schema.internalLinks.category })
      .from(schema.internalLinks);
    return [...new Set(all.map((l) => l.category))];
  }

  async create(data: InternalLink): Promise<InternalLink> {
    const [link] = await this.db
      .insert(schema.internalLinks)
      .values({
        id: data.id,
        title: data.title,
        url: data.url,
        description: data.description,
        category: data.category,
        sortOrder: data.sortOrder,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return link;
  }

  async update(id: string, data: Partial<InternalLink>): Promise<InternalLink | null> {
    const existing = await this.db
      .select()
      .from(schema.internalLinks)
      .where(eq(schema.internalLinks.id, id))
      .then((r) => r[0]);
    if (!existing) return null;

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.url !== undefined) updates.url = data.url;
    if (data.description !== undefined) updates.description = data.description;
    if (data.category !== undefined) updates.category = data.category;
    if (data.sortOrder !== undefined) updates.sortOrder = data.sortOrder;
    updates.updatedAt = new Date().toISOString();

    const [link] = await this.db
      .update(schema.internalLinks)
      .set(updates)
      .where(eq(schema.internalLinks.id, id))
      .returning();
    return link ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.internalLinks)
      .where(eq(schema.internalLinks.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.internalLinks).where(eq(schema.internalLinks.id, id));
    return true;
  }
}
