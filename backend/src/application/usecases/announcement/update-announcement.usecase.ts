import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import { shouldSetPublishedAt } from "../../../domain/rules/announcement.rules.js";
import type { UpdateAnnouncementInputDTO } from "./dto.js";
import type { AnnouncementStatus } from "../../../domain/models/announcement.js";

export class UpdateAnnouncementUseCase {
  async execute(id: string, input: UpdateAnnouncementInputDTO, uow: UnitOfWork) {
    const existing = await uow.announcementRepo.findById(id);

    if (!existing) {
      throw new ResourceNotFoundError("Announcement", id);
    }

    const { title, body, category, status, pinned } = input;
    const updates: Record<string, unknown> = {
      ...(title !== undefined && { title }),
      ...(body !== undefined && { body }),
      ...(category !== undefined && { category }),
      ...(status !== undefined && { status }),
      ...(pinned !== undefined && { pinned }),
      updatedAt: new Date().toISOString(),
    };

    if (shouldSetPublishedAt(status as AnnouncementStatus | undefined, existing.status as AnnouncementStatus)) {
      updates.publishedAt = new Date().toISOString();
    }

    const updated = await uow.announcementRepo.update(id, updates);
    return updated;
  }
}
