import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteAnnouncementUseCase {
  async execute(id: string, uow: UnitOfWork): Promise<void> {
    const deleted = await uow.announcementRepo.delete(id);

    if (!deleted) {
      throw new ResourceNotFoundError("Announcement", id);
    }
  }
}
