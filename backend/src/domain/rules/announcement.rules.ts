import type { AnnouncementStatus } from "../models/announcement.js";

export function shouldSetPublishedAt(
  newStatus: AnnouncementStatus | undefined,
  currentStatus: AnnouncementStatus,
): boolean {
  return newStatus === "published" && currentStatus === "draft";
}
