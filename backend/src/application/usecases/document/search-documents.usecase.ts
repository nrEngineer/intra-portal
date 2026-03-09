import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class SearchDocumentsUseCase {
  async execute(uow: UnitOfWork, search: string) {
    return uow.documentRepo.listDocuments(undefined, search);
  }
}
