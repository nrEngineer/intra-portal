import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { VALID_ROLES } from "../../../domain/models/user.js";
import type { UserRole } from "../../../domain/models/user.js";
import {
  InvalidRoleError,
  ResourceNotFoundError,
} from "../../../domain/errors/domain-error.js";
import type { UserOutputDTO } from "./dto.js";

export class ChangeRoleUseCase {
  async execute(uow: UnitOfWork, id: string, role: string): Promise<UserOutputDTO> {
    if (!VALID_ROLES.includes(role as UserRole)) {
      throw new InvalidRoleError();
    }

    const updated = await uow.userRepo.updateRole(id, role);
    if (!updated) {
      throw new ResourceNotFoundError("User", id);
    }

    return { id: updated.id, email: updated.email, name: updated.name, role: updated.role };
  }
}
