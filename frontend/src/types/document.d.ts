export interface Folder {
  id: number;
  name: string;
  parentId: number | null;
  createdBy: number;
  createdAt: string;
}

export interface Document {
  id: number;
  title: string;
  content: string;
  folderId: number | null;
  createdBy: number;
  createdByName: string;
  currentVersion: number;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  version: number;
  content: string;
  createdBy: number;
  createdAt: string;
}

export interface DocumentFilters {
  folderId?: number;
  search?: string;
}

export interface CreateFolderRequest {
  name: string;
  parentId?: number;
}

export interface CreateDocumentRequest {
  title: string;
  content: string;
  folderId?: number;
}

export interface UpdateDocumentRequest {
  title?: string;
  content?: string;
}
