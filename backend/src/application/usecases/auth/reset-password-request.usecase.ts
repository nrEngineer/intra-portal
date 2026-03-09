import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { EmailService } from "../../ports/services/email.service.js";

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export class ResetPasswordRequestUseCase {
  constructor(private readonly emailService: EmailService) {}

  async execute(uow: UnitOfWork, email: string): Promise<void> {
    const user = await uow.userRepo.findByEmail(email);

    // Silently do nothing if user not found — prevents email enumeration
    if (!user) {
      return;
    }

    const token = randomUUID();
    await uow.passwordResetRepo.create({
      id: randomUUID(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + RESET_TOKEN_EXPIRY_MS).toISOString(),
      createdAt: new Date().toISOString(),
    });

    this.emailService.send(email, "パスワードリセット", token);
  }
}
