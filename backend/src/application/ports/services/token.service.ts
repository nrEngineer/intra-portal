import type { UserRole } from "../../../domain/models/user.js";

export interface TokenPayload {
  userId: string;
  role: UserRole;
}

export interface TokenService {
  generateAccessToken(userId: string, role: UserRole): string;
  verifyAccessToken(token: string): TokenPayload | null;
}
