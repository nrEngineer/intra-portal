import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError, ForbiddenError } from "../../../domain/errors/domain-error.js";
import type { User } from "../../../domain/models/user.js";

export class DeleteEventUseCase {
  async execute(eventId: string, user: User, uow: UnitOfWork): Promise<void> {
    const existing = await uow.scheduleRepo.findEventById(eventId);

    if (!existing) {
      throw new ResourceNotFoundError("Event", eventId);
    }

    if (existing.createdBy !== user.id && user.role !== "admin") {
      throw new ForbiddenError();
    }

    await uow.scheduleRepo.deleteEvent(eventId);
  }
}
