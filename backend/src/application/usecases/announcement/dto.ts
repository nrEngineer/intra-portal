import type { User } from "../../../domain/models/user.js";

export interface ListAnnouncementsInputDTO {
  user: User;
  drafts?: string;
  category?: string;
  search?: string;
  page?: string;
}

export interface CreateAnnouncementInputDTO {
  title: string;
  body: string;
  category: string;
  status: string;
  pinned: boolean;
  userId: string;
}

export interface UpdateAnnouncementInputDTO {
  title?: string;
  body?: string;
  category?: string;
  status?: string;
  pinned?: boolean;
}

export interface ValidateUploadInputDTO {
  fileCount: number;
  fileSizes: number[];
}
