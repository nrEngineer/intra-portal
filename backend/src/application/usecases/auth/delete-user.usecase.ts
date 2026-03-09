import type { UnitOfWork } from "../../ports/unit-of-work.js";
import {
  CannotDeleteSelfError,
  ResourceNotFoundError,
} from "../../../domain/errors/domain-error.js";

export class DeleteUserUseCase {
  async execute(uow: UnitOfWork, id: string, requesterId: string): Promise<void> {
    if (id === requesterId) {
      throw new CannotDeleteSelfError();
    }

    const user = await uow.userRepo.findById(id);
    if (!user) {
      throw new ResourceNotFoundError("User", id);
    }

    await uow.userRepo.delete(id);
  }
}
