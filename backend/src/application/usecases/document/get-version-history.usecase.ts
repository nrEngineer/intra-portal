import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class GetVersionHistoryUseCase {
  async execute(documentId: string, uow: UnitOfWork) {
    return uow.documentRepo.getVersions(documentId);
  }
}
