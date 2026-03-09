import type { UnitOfWork } from "../../ports/unit-of-work.js";

export class LogoutUseCase {
  async execute(uow: UnitOfWork, refreshToken: string): Promise<void> {
    await uow.refreshTokenRepo.deleteByToken(refreshToken);
  }
}
