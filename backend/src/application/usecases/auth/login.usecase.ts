import { randomUUID } from "crypto";
import type { UnitOfWork } from "../../ports/unit-of-work.js";
import type { HashService } from "../../ports/services/hash.service.js";
import type { TokenService } from "../../ports/services/token.service.js";
import type { UserRole } from "../../../domain/models/user.js";
import {
  AccountLockedError,
  InvalidCredentialsError,
} from "../../../domain/errors/domain-error.js";
import { isAccountLocked, shouldLockAccount, calculateLockUntil } from "../../../domain/rules/auth.rules.js";
import type { LoginInputDTO, LoginOutputDTO } from "./dto.js";

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export class LoginUseCase {
  constructor(
    private readonly hashService: HashService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(uow: UnitOfWork, input: LoginInputDTO): Promise<LoginOutputDTO> {
    const user = await uow.userRepo.findByEmail(input.email);

    // Check account lock
    if (user && user.lockedUntil) {
      if (isAccountLocked(user.lockedUntil)) {
        throw new AccountLockedError();
      }
      // Lock expired — reset
      await uow.userRepo.updateFailedAttempts(user.id, 0, null);
    }

    // No user — run dummy compare to mitigate timing attacks
    if (!user) {
      await this.hashService.compare(input.password, "$2b$10$dummy.hash.for.timing.attack.mitigation");
      throw new InvalidCredentialsError();
    }

    const valid = await this.hashService.compare(input.password, user.passwordHash);
    if (!valid) {
      const newCount = user.failedAttempts + 1;
      const lockedUntil = shouldLockAccount(newCount) ? calculateLockUntil() : null;
      await uow.userRepo.updateFailedAttempts(user.id, newCount, lockedUntil);
      throw new InvalidCredentialsError();
    }

    // Successful login — reset failed attempts
    await uow.userRepo.updateFailedAttempts(user.id, 0, null);

    const accessToken = this.tokenService.generateAccessToken(user.id, user.role as UserRole);

    const refreshToken = randomUUID();
    await uow.refreshTokenRepo.create({
      id: randomUUID(),
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS).toISOString(),
      createdAt: new Date().toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    };
  }
}
