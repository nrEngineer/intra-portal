import jwt from "jsonwebtoken";
import type { TokenService, TokenPayload } from "../../application/ports/services/token.service.js";
import type { UserRole } from "../../domain/models/user.js";

const ACCESS_TOKEN_EXPIRY = "15m";

let _jwtSecret: string | undefined;

export function setJwtSecret(secret: string) {
  _jwtSecret = secret;
}

function getJwtSecret(): string {
  const secret = _jwtSecret || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}

export class JwtTokenService implements TokenService {
  generateAccessToken(userId: string, role: UserRole): string {
    return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
  }

  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return jwt.verify(token, getJwtSecret()) as TokenPayload;
    } catch {
      return null;
    }
  }
}
