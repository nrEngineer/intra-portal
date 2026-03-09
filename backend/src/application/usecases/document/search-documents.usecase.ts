import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class SearchDocumentsUseCase {
  async execute(search: string, uow: UnitOfWork) {
    return uow.documentRepo.listDocuments(undefined, search);
  }
}
