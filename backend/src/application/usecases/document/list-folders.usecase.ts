import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class ListFoldersUseCase {
  async execute(uow: UnitOfWork, parentId: string | null) {
    return uow.documentRepo.listFolders(parentId);
  }
}
