import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteAnnouncementUseCase {
  async execute(uow: UnitOfWork, id: string): Promise<void> {
    const deleted = await uow.announcementRepo.delete(id);

    if (!deleted) {
      throw new ResourceNotFoundError("Announcement", id);
    }
  }
}
