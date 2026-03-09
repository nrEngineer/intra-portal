import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListDocumentsUseCase {
  async execute(folderId: string | undefined, search: string | undefined, uow: UnitOfWork) {
    return uow.documentRepo.listDocuments(folderId, search);
  }
}
