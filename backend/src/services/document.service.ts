import { eq, like, or, sql, desc, isNull } from "drizzle-orm";
import { getDb } from "../db/connection.js";
import * as schema from "../db/schema.js";
import { randomUUID } from "crypto";

export class DocumentService {
  static async listFolders(parentId: string | null) {
    const db = getDb();
    return parentId
      ? db.select().from(schema.folders).where(eq(schema.folders.parentId, parentId))
      : db.select().from(schema.folders).where(isNull(schema.folders.parentId));
  }

  static async createFolder(name: string, parentId: string | null, userId: string) {
    const db = getDb();
    const [folder] = await db
      .insert(schema.folders)
      .values({
        id: randomUUID(),
        name,
        parentId,
        createdBy: userId,
        createdAt: new Date().toISOString(),
      })
      .returning();
    return folder;
  }

  static async updateFolder(id: string, name: string) {
    const db = getDb();
    const folder = await db.select().from(schema.folders).where(eq(schema.folders.id, id)).then((r) => r[0]);
    if (!folder) return null;
    const [updated] = await db.update(schema.folders).set({ name }).where(eq(schema.folders.id, id)).returning();
    return updated;
  }

  static async deleteFolder(id: string) {
    const db = getDb();

    const childFolders = await db.select().from(schema.folders).where(eq(schema.folders.parentId, id));
    const childDocs = await db.select().from(schema.documents).where(eq(schema.documents.folderId, id));

    if (childFolders.length > 0 || childDocs.length > 0) {
      return { error: "フォルダが空でないか、見つかりません", status: 400 as const };
    }

    const existing = await db.select().from(schema.folders).where(eq(schema.folders.id, id)).then((r) => r[0]);
    if (!existing) {
      return { error: "フォルダが空でないか、見つかりません", status: 400 as const };
    }

    await db.delete(schema.folders).where(eq(schema.folders.id, id));
    return { success: true };
  }

  static async listDocuments(folderId?: string, search?: string) {
    const db = getDb();

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      return db
        .select()
        .from(schema.documents)
        .where(
          or(
            like(sql`lower(${schema.documents.title})`, q),
            like(sql`lower(${schema.documents.fileName})`, q),
          ),
        );
    }

    return folderId
      ? db.select().from(schema.documents).where(eq(schema.documents.folderId, folderId))
      : db.select().from(schema.documents).where(isNull(schema.documents.folderId));
  }

  static async getDocument(id: string) {
    const db = getDb();
    return db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .then((r) => r[0] ?? null);
  }

  static async getVersions(documentId: string) {
    const db = getDb();
    return db
      .select()
      .from(schema.documentVersions)
      .where(eq(schema.documentVersions.documentId, documentId))
      .orderBy(desc(schema.documentVersions.version));
  }

  static async createDocument(
    data: { title: string; folderId?: string; fileUrl: string; fileName: string; fileSize: number },
    userId: string,
  ) {
    const db = getDb();
    const now = new Date().toISOString();
    const docId = randomUUID();

    const [doc] = await db
      .insert(schema.documents)
      .values({
        id: docId,
        title: data.title,
        folderId: data.folderId || null,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        version: 1,
        createdBy: userId,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await db.insert(schema.documentVersions).values({
      id: randomUUID(),
      documentId: docId,
      version: 1,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      createdBy: userId,
      createdAt: now,
    });

    return doc;
  }

  static async updateDocument(
    id: string,
    data: { title: string; fileUrl?: string; fileName?: string; fileSize?: number },
    userId: string,
  ) {
    const db = getDb();
    const now = new Date().toISOString();

    const existing = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .then((r) => r[0]);

    if (!existing) return null;

    const isNewFile = data.fileUrl && data.fileUrl !== existing.fileUrl;
    const newVersion = isNewFile ? existing.version + 1 : existing.version;

    if (isNewFile) {
      await db.insert(schema.documentVersions).values({
        id: randomUUID(),
        documentId: id,
        version: newVersion,
        fileUrl: data.fileUrl!,
        fileName: data.fileName || existing.fileName,
        fileSize: data.fileSize || existing.fileSize,
        createdBy: userId,
        createdAt: now,
      });
    }

    const [doc] = await db
      .update(schema.documents)
      .set({
        title: data.title,
        fileUrl: data.fileUrl,
        version: newVersion,
        updatedAt: now,
      })
      .where(eq(schema.documents.id, id))
      .returning();

    return doc;
  }

  static async deleteDocument(id: string) {
    const db = getDb();

    const existing = await db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .then((r) => r[0]);

    if (!existing) return false;

    await db.delete(schema.documentVersions).where(eq(schema.documentVersions.documentId, id));
    await db.delete(schema.documents).where(eq(schema.documents.id, id));
    return true;
  }
}
