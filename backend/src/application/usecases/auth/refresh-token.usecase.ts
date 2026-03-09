import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { TokenService } from "../../ports/services/token.service.js";
import type { UserRole } from "../../../domain/models/user.js";
import { InvalidTokenError } from "../../../domain/errors/domain-error.js";

export class RefreshTokenUseCase {
  constructor(private readonly tokenService: TokenService) {}

  async execute(uow: UnitOfWork, refreshToken: string): Promise<{ accessToken: string }> {
    const entry = await uow.refreshTokenRepo.findByToken(refreshToken);

    if (!entry || new Date(entry.expiresAt).getTime() < Date.now()) {
      throw new InvalidTokenError();
    }

    const user = await uow.userRepo.findById(entry.userId);
    if (!user) {
      throw new InvalidTokenError();
    }

    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole);
    return { accessToken };
  }
}
