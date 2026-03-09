import type { UnitOfWork } from "../../ports/unit-of-work.js";
import { ResourceNotFoundError } from "../../../domain/errors/domain-error.js";
import type { UpdateEmployeeInputDTO } from "./dto.js";

export class UpdateEmployeeUseCase {
  async execute(id: string, input: UpdateEmployeeInputDTO, uow: UnitOfWork) {
    const updated = await uow.employeeRepo.update(id, {
      name: input.name,
      email: input.email,
      department: input.department,
      position: input.position,
      photoUrl: input.photoUrl !== undefined ? input.photoUrl : null,
      phone: input.phone !== undefined ? input.phone : "",
      joinedAt: input.joinedAt,
      updatedAt: new Date().toISOString(),
    });

    if (!updated) {
      throw new ResourceNotFoundError("Employee", id);
    }

    return updated;
  }
}
