import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { RegisterEmployeeInputDTO } from "./dto.js";

export class RegisterEmployeeUseCase {
  async execute(uow: UnitOfWork, input: RegisterEmployeeInputDTO) {
    const now = new Date().toISOString();

    return uow.employeeRepo.create({
      id: randomUUID(),
      userId: input.userId,
      name: input.name,
      email: input.email,
      department: input.department,
      position: input.position,
      photoUrl: input.photoUrl || null,
      phone: input.phone || "",
      joinedAt: input.joinedAt,
      createdAt: now,
      updatedAt: now,
    });
  }
}
