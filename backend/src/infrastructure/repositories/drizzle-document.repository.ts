import { eq, like, or, sql, desc, isNull } from "drizzle-orm";
import type { LibSQLDatabase } from "drizzle-orm/libsql";
import * as schema from "../../db/schema.js";
import type { DocumentRepository } from "../../application/ports/repositories/document.repository.js";
import type { Document, DocumentVersion, Folder } from "../../domain/models/document.js";

type AppDatabase = LibSQLDatabase<Record<string, never>>;

export class DrizzleDocumentRepository implements DocumentRepository {
  constructor(private readonly db: AppDatabase) {}

  // Folders

  async listFolders(parentId: string | null): Promise<Folder[]> {
    const rows = parentId
      ? await this.db
          .select()
          .from(schema.folders)
          .where(eq(schema.folders.parentId, parentId))
      : await this.db
          .select()
          .from(schema.folders)
          .where(isNull(schema.folders.parentId));

    return rows.map((f) => ({
      id: f.id,
      name: f.name,
      parentId: f.parentId ?? null,
      createdBy: f.createdBy,
      createdAt: f.createdAt,
    }));
  }

  async createFolder(data: Folder): Promise<Folder> {
    const [folder] = await this.db
      .insert(schema.folders)
      .values({
        id: data.id,
        name: data.name,
        parentId: data.parentId ?? null,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
      })
      .returning();
    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId ?? null,
      createdBy: folder.createdBy,
      createdAt: folder.createdAt,
    };
  }

  async findFolderById(id: string): Promise<Folder | null> {
    const result = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id));
    const f = result[0];
    if (!f) return null;
    return {
      id: f.id,
      name: f.name,
      parentId: f.parentId ?? null,
      createdBy: f.createdBy,
      createdAt: f.createdAt,
    };
  }

  async updateFolder(id: string, name: string): Promise<Folder | null> {
    const existing = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id))
      .then((r) => r[0]);
    if (!existing) return null;

    const [updated] = await this.db
      .update(schema.folders)
      .set({ name })
      .where(eq(schema.folders.id, id))
      .returning();
    return {
      id: updated.id,
      name: updated.name,
      parentId: updated.parentId ?? null,
      createdBy: updated.createdBy,
      createdAt: updated.createdAt,
    };
  }

  async deleteFolder(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.folders).where(eq(schema.folders.id, id));
    return true;
  }

  async hasChildren(folderId: string): Promise<boolean> {
    const childFolders = await this.db
      .select()
      .from(schema.folders)
      .where(eq(schema.folders.parentId, folderId));
    if (childFolders.length > 0) return true;

    const childDocs = await this.db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.folderId, folderId));
    return childDocs.length > 0;
  }

  // Documents

  async listDocuments(folderId?: string, search?: string): Promise<Document[]> {
    let rows;

    if (search) {
      const q = `%${search.toLowerCase()}%`;
      rows = await this.db
        .select()
        .from(schema.documents)
        .where(
          or(
            like(sql`lower(${schema.documents.title})`, q),
            like(sql`lower(${schema.documents.fileName})`, q),
          ),
        );
    } else if (folderId) {
      rows = await this.db
        .select()
        .from(schema.documents)
        .where(eq(schema.documents.folderId, folderId));
    } else {
      rows = await this.db
        .select()
        .from(schema.documents)
        .where(isNull(schema.documents.folderId));
    }

    return rows.map((d) => ({
      id: d.id,
      title: d.title,
      folderId: d.folderId ?? null,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileSize: d.fileSize,
      version: d.version,
      createdBy: d.createdBy,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }));
  }

  async findDocumentById(id: string): Promise<Document | null> {
    const result = await this.db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id));
    const d = result[0];
    if (!d) return null;
    return {
      id: d.id,
      title: d.title,
      folderId: d.folderId ?? null,
      fileUrl: d.fileUrl,
      fileName: d.fileName,
      fileSize: d.fileSize,
      version: d.version,
      createdBy: d.createdBy,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    };
  }

  async createDocument(data: Document): Promise<Document> {
    const [doc] = await this.db
      .insert(schema.documents)
      .values({
        id: data.id,
        title: data.title,
        folderId: data.folderId ?? null,
        fileUrl: data.fileUrl,
        fileName: data.fileName,
        fileSize: data.fileSize,
        version: data.version,
        createdBy: data.createdBy,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .returning();
    return {
      id: doc.id,
      title: doc.title,
      folderId: doc.folderId ?? null,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      version: doc.version,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async updateDocument(id: string, data: Partial<Document>): Promise<Document | null> {
    const existing = await this.db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .then((r) => r[0]);
    if (!existing) return null;

    const updates: Record<string, unknown> = {};
    if (data.title !== undefined) updates.title = data.title;
    if (data.folderId !== undefined) updates.folderId = data.folderId;
    if (data.fileUrl !== undefined) updates.fileUrl = data.fileUrl;
    if (data.fileName !== undefined) updates.fileName = data.fileName;
    if (data.fileSize !== undefined) updates.fileSize = data.fileSize;
    if (data.version !== undefined) updates.version = data.version;
    updates.updatedAt = new Date().toISOString();

    const [doc] = await this.db
      .update(schema.documents)
      .set(updates)
      .where(eq(schema.documents.id, id))
      .returning();

    return {
      id: doc.id,
      title: doc.title,
      folderId: doc.folderId ?? null,
      fileUrl: doc.fileUrl,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      version: doc.version,
      createdBy: doc.createdBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }

  async deleteDocument(id: string): Promise<boolean> {
    const existing = await this.db
      .select()
      .from(schema.documents)
      .where(eq(schema.documents.id, id))
      .then((r) => r[0]);
    if (!existing) return false;
    await this.db.delete(schema.documents).where(eq(schema.documents.id, id));
    return true;
  }

  // Versions

  async getVersions(documentId: string): Promise<DocumentVersion[]> {
    const rows = await this.db
      .select()
      .from(schema.documentVersions)
      .where(eq(schema.documentVersions.documentId, documentId))
      .orderBy(desc(schema.documentVersions.version));

    return rows.map((v) => ({
      id: v.id,
      documentId: v.documentId,
      version: v.version,
      fileUrl: v.fileUrl,
      fileName: v.fileName,
      fileSize: v.fileSize,
      createdBy: v.createdBy,
      createdAt: v.createdAt,
    }));
  }

  async createVersion(data: DocumentVersion): Promise<void> {
    await this.db.insert(schema.documentVersions).values({
      id: data.id,
      documentId: data.documentId,
      version: data.version,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      createdBy: data.createdBy,
      createdAt: data.createdAt,
    });
  }

  async deleteVersionsByDocumentId(documentId: string): Promise<void> {
    await this.db
      .delete(schema.documentVersions)
      .where(eq(schema.documentVersions.documentId, documentId));
  }
}
