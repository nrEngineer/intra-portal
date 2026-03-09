export type Category = "全社" | "部署" | "IT" | "総務" | "その他";
export type AnnouncementStatus = "draft" | "published";
export type UserRole = "admin" | "editor" | "member";

export const VALID_ROLES: UserRole[] = ["admin", "editor", "member"];

/** Shared Hono environment type — use this instead of per-file `type Env` */
export type HonoEnv = { Variables: { user: User } };

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

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

// 社員名簿
export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  department: string;
  position: string;
  photoUrl: string | null;
  phone: string;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

// スケジュール
export interface ScheduleEvent {
  id: string;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  teamId: string;
  createdBy: string;
  allDay: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  memberIds: string[];
}

// リンク集
export type LinkCategory = string;

export interface InternalLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// ドキュメント管理
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
