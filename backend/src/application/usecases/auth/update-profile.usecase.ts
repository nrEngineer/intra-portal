import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { UserOutputDTO } from "./dto.js";

export class UpdateProfileUseCase {
  async execute(uow: UnitOfWork, id: string, name: string): Promise<UserOutputDTO> {
    const updated = await uow.userRepo.updateName(id, name);
    if (!updated) {
      throw new ResourceNotFoundError("User", id);
    }
    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }
}
