import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { CreateDocumentInputDTO } from "./dto.js";

export class CreateDocumentUseCase {
  async execute(uow: UnitOfWork, input: CreateDocumentInputDTO) {
    const now = new Date().toISOString();
    const docId = randomUUID();

    const doc = await uow.documentRepo.createDocument({
      id: docId,
      title: input.title,
      folderId: input.folderId || null,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      version: 1,
      createdBy: input.userId,
      createdAt: now,
      updatedAt: now,
    });

    await uow.documentRepo.createVersion({
      id: randomUUID(),
      documentId: docId,
      version: 1,
      fileUrl: input.fileUrl,
      fileName: input.fileName,
      fileSize: input.fileSize,
      createdBy: input.userId,
      createdAt: now,
    });

    return doc;
  }
}
