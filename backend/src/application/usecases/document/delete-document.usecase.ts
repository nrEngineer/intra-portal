import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteDocumentUseCase {
  async execute(id: string, uow: UnitOfWork): Promise<void> {
    const existing = await uow.documentRepo.findDocumentById(id);

    if (!existing) {
      throw new ResourceNotFoundError("Document", id);
    }

    await uow.documentRepo.deleteVersionsByDocumentId(id);
    await uow.documentRepo.deleteDocument(id);
  }
}
