import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateAnnouncementInputDTO } from "./dto.js";

export class CreateAnnouncementUseCase {
  async execute(uow: UnitOfWork, input: CreateAnnouncementInputDTO) {
    const now = new Date().toISOString();
    const id = randomUUID();

    const announcement = await uow.announcementRepo.create({
      id,
      title: input.title,
      body: input.body,
      category: input.category,
      status: input.status,
      pinned: input.pinned,
      createdBy: input.userId,
      publishedAt: input.status === "published" ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    return { ...announcement, attachments: [] };
  }
}
