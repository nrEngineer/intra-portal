import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListFoldersUseCase {
  async execute(parentId: string | null, uow: UnitOfWork) {
    return uow.documentRepo.listFolders(parentId);
  }
}
