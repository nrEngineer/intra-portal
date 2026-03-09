import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { UpdateDocumentInputDTO } from "./dto.js";

export class UpdateDocumentUseCase {
  async execute(id: string, input: UpdateDocumentInputDTO, uow: UnitOfWork) {
    const now = new Date().toISOString();

    const existing = await uow.documentRepo.findDocumentById(id);

    if (!existing) {
      throw new ResourceNotFoundError("Document", id);
    }

    const isNewFile = input.fileUrl !== undefined && input.fileUrl !== existing.fileUrl;
    const newVersion = isNewFile ? existing.version + 1 : existing.version;

    if (isNewFile) {
      await uow.documentRepo.createVersion({
        id: randomUUID(),
        documentId: id,
        version: newVersion,
        fileUrl: input.fileUrl!,
        fileName: input.fileName || existing.fileName,
        fileSize: input.fileSize !== undefined ? input.fileSize : existing.fileSize,
        createdBy: input.userId,
        createdAt: now,
      });
    }

    const updated = await uow.documentRepo.updateDocument(id, {
      title: input.title,
      fileUrl: input.fileUrl,
      version: newVersion,
      updatedAt: now,
    });

    return updated;
  }
}
