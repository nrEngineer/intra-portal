import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";

export class UpdateFolderUseCase {
  async execute(uow: UnitOfWork, id: string, name: string) {
    const existing = await uow.documentRepo.findFolderById(id);

    if (!existing) {
      throw new ResourceNotFoundError("Folder", id);
    }

    const updated = await uow.documentRepo.updateFolder(id, name);
    return updated;
  }
}
