import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class GetVersionHistoryUseCase {
  async execute(uow: UnitOfWork, documentId: string) {
    return uow.documentRepo.getVersions(documentId);
  }
}
