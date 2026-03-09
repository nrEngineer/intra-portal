import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateEventInputDTO } from "./dto.js";

export class CreateEventUseCase {
  async execute(uow: UnitOfWork, input: CreateEventInputDTO) {
    const now = new Date().toISOString();

    return uow.scheduleRepo.createEvent({
      id: randomUUID(),
      title: input.title,
      description: input.description || "",
      startAt: input.startAt,
      endAt: input.endAt,
      teamId: input.teamId,
      createdBy: input.userId,
      allDay: input.allDay || false,
      createdAt: now,
      updatedAt: now,
    });
  }
}
