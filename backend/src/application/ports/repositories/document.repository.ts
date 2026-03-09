import type { Document, DocumentVersion, Folder } from "../../../domain/models/document.js";

export interface DocumentRepository {
  // Folders
  listFolders(parentId: string | null): Promise<Folder[]>;
  createFolder(data: Folder): Promise<Folder>;
  findFolderById(id: string): Promise<Folder | null>;
  updateFolder(id: string, name: string): Promise<Folder | null>;
  deleteFolder(id: string): Promise<boolean>;
  hasChildren(folderId: string): Promise<boolean>;

  // Documents
  listDocuments(folderId?: string, search?: string): Promise<Document[]>;
  findDocumentById(id: string): Promise<Document | null>;
  createDocument(data: Document): Promise<Document>;
  updateDocument(id: string, data: Partial<Document>): Promise<Document | null>;
  deleteDocument(id: string): Promise<boolean>;

  // Versions
  getVersions(documentId: string): Promise<DocumentVersion[]>;
  createVersion(data: DocumentVersion): Promise<void>;
  deleteVersionsByDocumentId(documentId: string): Promise<void>;
}
