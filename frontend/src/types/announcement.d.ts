export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: 'general' | 'important' | 'event' | 'maintenance';
  status: 'draft' | 'published';
  isPinned: boolean;
  authorId: number;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Attachment {
  id: number;
  announcementId: number;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  createdAt: string;
}

export interface AnnouncementDetail extends Announcement {
  attachments: Attachment[];
}

export interface AnnouncementListResponse {
  data: Announcement[];
  total: number;
  page: number;
  totalPages: number;
}

export interface AnnouncementFilters {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  category: string;
  status?: string;
  isPinned?: boolean;
}

export interface UpdateAnnouncementRequest extends Partial<CreateAnnouncementRequest> {}
