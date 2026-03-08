import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import type { UserRole } from "./types.js";

let _jwtSecret: string | undefined;
export function setJwtSecret(secret: string) { _jwtSecret = secret; }
function getJwtSecret(): string {
  const secret = _jwtSecret || process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not configured");
  return secret;
}
const ACCESS_TOKEN_EXPIRY = "15m";

export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "パスワードは8文字以上必要です";
  if (!PASSWORD_REGEX.test(password)) return "パスワードは英字と数字を含む必要があります";
  return null;
}

export function generateAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, getJwtSecret(), { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): { userId: string; role: UserRole } | null {
  try {
    return jwt.verify(token, getJwtSecret()) as { userId: string; role: UserRole };
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}
