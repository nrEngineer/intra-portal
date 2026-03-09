import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateLinkInputDTO } from "./dto.js";

export class CreateLinkUseCase {
  async execute(input: CreateLinkInputDTO, uow: UnitOfWork) {
    const now = new Date().toISOString();

    return uow.linkRepo.create({
      id: randomUUID(),
      title: input.title,
      url: input.url,
      description: input.description || "",
      category: input.category,
      sortOrder: input.sortOrder || 0,
      createdBy: input.userId,
      createdAt: now,
      updatedAt: now,
    });
  }
}
