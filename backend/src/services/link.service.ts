import { eq, asc } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import { randomUUID } from "crypto";

export class LinkService {
  static async list(category?: string) {
    const db = getDb();

    if (category) {
      return db
        .select()
        .from(schema.internalLinks)
        .where(eq(schema.internalLinks.category, category))
        .orderBy(asc(schema.internalLinks.sortOrder));
    }
    return db
      .select()
      .from(schema.internalLinks)
      .orderBy(asc(schema.internalLinks.sortOrder));
  }

  static async getCategories() {
    const db = getDb();
    const all = await db
      .select({ category: schema.internalLinks.category })
      .from(schema.internalLinks);
    return [...new Set(all.map((l) => l.category))];
  }

  static async create(
    data: { title: string; url: string; description?: string; category: string; sortOrder?: number },
    userId: string,
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    const [link] = await db
      .insert(schema.internalLinks)
      .values({
        id: randomUUID(),
        title: data.title,
        url: data.url,
        description: data.description || "",
        category: data.category,
        sortOrder: data.sortOrder || 0,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return link;
  }

  static async update(id: string, data: { title: string; url: string; description?: string; category: string }) {
    const db = getDb();
    const [link] = await db
      .update(schema.internalLinks)
      .set({
        title: data.title,
        url: data.url,
        description: data.description,
        category: data.category,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.internalLinks.id, id))
      .returning();
    return link ?? null;
  }

  static async delete(id: string) {
    const db = getDb();
    const existing = await db
      .select()
      .from(schema.internalLinks)
      .where(eq(schema.internalLinks.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await db.delete(schema.internalLinks).where(eq(schema.internalLinks.id, id));
    return true;
  }
}
