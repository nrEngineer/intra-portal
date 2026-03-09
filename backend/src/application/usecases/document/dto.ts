export interface CreateFolderInputDTO {
  name: string;
  parentId: string | null;
  userId: string;
}

export interface CreateDocumentInputDTO {
  title: string;
  folderId?: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  userId: string;
}

export interface UpdateDocumentInputDTO {
  title: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  userId: string;
}
