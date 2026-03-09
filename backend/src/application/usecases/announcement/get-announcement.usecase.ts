import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { User } from "../../../domain/models/user.js";

export class GetAnnouncementUseCase {
  async execute(uow: UnitOfWork, id: string, user: User) {
    const announcement = await uow.announcementRepo.findById(id);

    if (!announcement) {
      throw new ResourceNotFoundError("Announcement", id);
    }

    if (announcement.status === "draft" && user.role !== "admin") {
      throw new ResourceNotFoundError("Announcement", id);
    }

    const isRead = await uow.announcementRepo.isRead(user.id, id);
    if (!isRead) {
      await uow.announcementRepo.markAsRead({
        id: randomUUID(),
        userId: user.id,
        announcementId: id,
        readAt: new Date().toISOString(),
      });
    }

    const attachments = await uow.announcementRepo.getAttachments(id);

    return { ...announcement, attachments };
  }
}
