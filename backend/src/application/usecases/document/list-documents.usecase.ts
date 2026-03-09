import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListDocumentsUseCase {
  async execute(uow: UnitOfWork, folderId: string | undefined, search: string | undefined) {
    return uow.documentRepo.listDocuments(folderId, search);
  }
}
