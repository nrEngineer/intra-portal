import type { Category, AnnouncementStatus } from "../../../domain/models/announcement.js";

export interface AnnouncementRow {
  id: string;
  title: string;
  body: string;
  category: string;
  status: string;
  pinned: boolean | number;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementListQuery {
  showDrafts: boolean;
  category?: string;
  search?: string;
  page: number;
  limit: number;
}

export interface AnnouncementRepository {
  findAll(query: AnnouncementListQuery): Promise<{ data: AnnouncementRow[]; total: number }>;
  findById(id: string): Promise<AnnouncementRow | null>;
  create(data: {
    id: string;
    title: string;
    body: string;
    category: string;
    status: string;
    pinned: boolean;
    createdBy: string;
    publishedAt: string | null;
    createdAt: string;
    updatedAt: string;
  }): Promise<AnnouncementRow>;
  update(id: string, data: Record<string, unknown>): Promise<AnnouncementRow | null>;
  delete(id: string): Promise<boolean>;
  getAttachments(announcementId: string): Promise<Array<{
    id: string;
    announcementId: string;
    fileName: string;
    fileUrl: string;
    fileSize: number;
  }>>;
  getUnreadCount(userId: string): Promise<number>;
  isRead(userId: string, announcementId: string): Promise<boolean>;
  markAsRead(data: { id: string; userId: string; announcementId: string; readAt: string }): Promise<void>;
}
