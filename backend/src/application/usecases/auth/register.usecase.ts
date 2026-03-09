import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { HashService } from "../../ports/services/hash.service.js";
import { VALID_ROLES } from "../../../domain/models/user.js";
import type { UserRole } from "../../../domain/models/user.js";
import {
  InvalidRoleError,
  InvalidPasswordError,
  ConflictError,
} from "../../../domain/errors/domain-error.js";
import { validatePassword } from "../../../domain/rules/auth.rules.js";
import type { RegisterInputDTO, UserOutputDTO } from "./dto.js";

export class RegisterUseCase {
  constructor(private readonly hashService: HashService) {}

  async execute(uow: UnitOfWork, input: RegisterInputDTO): Promise<UserOutputDTO> {
    if (!VALID_ROLES.includes(input.role as UserRole)) {
      throw new InvalidRoleError();
    }

    const passwordError = validatePassword(input.password);
    if (passwordError) {
      throw new InvalidPasswordError(passwordError);
    }

    const existing = await uow.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError("このメールアドレスは既に使用されています");
    }

    const passwordHash = await this.hashService.hash(input.password);
    const now = new Date().toISOString();

    const user = await uow.userRepo.create({
      id: randomUUID(),
      email: input.email,
      name: input.name,
      passwordHash,
      role: input.role,
      createdAt: now,
      updatedAt: now,
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
