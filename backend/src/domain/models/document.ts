export interface Document {
  id: string;
  title: string;
  folderId: string | null;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  version: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdBy: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdBy: string;
  createdAt: string;
}
