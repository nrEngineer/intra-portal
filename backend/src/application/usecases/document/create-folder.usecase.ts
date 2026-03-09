import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateFolderInputDTO } from "./dto.js";

export class CreateFolderUseCase {
  async execute(input: CreateFolderInputDTO, uow: UnitOfWork) {
    const now = new Date().toISOString();

    return uow.documentRepo.createFolder({
      id: randomUUID(),
      name: input.name,
      parentId: input.parentId,
      createdBy: input.userId,
      createdAt: now,
    });
  }
}
