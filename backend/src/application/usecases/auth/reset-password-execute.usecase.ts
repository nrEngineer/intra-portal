import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { HashService } from "../../ports/services/hash.service.js";
import {
  InvalidPasswordError,
  InvalidTokenError,
} from "../../../domain/errors/domain-error.js";
import { validatePassword } from "../../../domain/rules/auth.rules.js";

export class ResetPasswordExecuteUseCase {
  constructor(private readonly hashService: HashService) {}

  async execute(uow: UnitOfWork, token: string, newPassword: string): Promise<void> {
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      throw new InvalidPasswordError(passwordError);
    }

    const entry = await uow.passwordResetRepo.findByToken(token);

    if (!entry || new Date(entry.expiresAt).getTime() < Date.now() || entry.usedAt) {
      throw new InvalidTokenError("無効または期限切れのトークンです");
    }

    const passwordHash = await this.hashService.hash(newPassword);
    await uow.userRepo.updatePassword(entry.userId, passwordHash);
    await uow.passwordResetRepo.delete(entry.id);
  }
}
