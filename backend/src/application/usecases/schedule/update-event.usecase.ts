import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError, ForbiddenError } from "../../../domain/errors/domain-error.js";
import type { User } from "../../../domain/models/user.js";
import type { UpdateEventInputDTO } from "./dto.js";

export class UpdateEventUseCase {
  async execute(eventId: string, input: UpdateEventInputDTO, user: User, uow: UnitOfWork) {
    const existing = await uow.scheduleRepo.findEventById(eventId);

    if (!existing) {
      throw new ResourceNotFoundError("Event", eventId);
    }

    if (existing.createdBy !== user.id && user.role !== "admin") {
      throw new ForbiddenError();
    }

    const updated = await uow.scheduleRepo.updateEvent(eventId, {
      title: input.title,
      description: input.description,
      startAt: input.startAt,
      endAt: input.endAt,
      allDay: input.allDay,
      updatedAt: new Date().toISOString(),
    });

    return updated;
  }
}
