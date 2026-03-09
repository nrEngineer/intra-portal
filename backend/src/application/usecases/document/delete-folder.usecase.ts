import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { FolderNotEmptyError, ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class DeleteFolderUseCase {
  async execute(id: string, uow: UnitOfWork): Promise<void> {
    const hasChildren = await uow.documentRepo.hasChildren(id);

    if (hasChildren) {
      throw new FolderNotEmptyError();
    }

    const existing = await uow.documentRepo.findFolderById(id);

    if (!existing) {
      throw new ResourceNotFoundError("Folder", id);
    }

    await uow.documentRepo.deleteFolder(id);
  }
}
