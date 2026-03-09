import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { UserOutputDTO } from "./dto.js";

export class GetProfileUseCase {
  async execute(uow: UnitOfWork, id: string): Promise<UserOutputDTO> {
    const user = await uow.userRepo.findById(id);
    if (!user) {
      throw new ResourceNotFoundError("User", id);
    }
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
