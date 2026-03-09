export type Category = "全社" | "部署" | "IT" | "総務" | "その他";
export type AnnouncementStatus = "draft" | "published";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  category: Category;
  status: AnnouncementStatus;
  pinned: boolean;
  createdBy: string;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  announcementId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
}

export interface ReadStatus {
  userId: string;
  announcementId: string;
  readAt: string;
}
