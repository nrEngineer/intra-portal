import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import type { UserRole } from "./types.js";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-key-change-in-production";
const ACCESS_TOKEN_EXPIRY = "15m";

export const PASSWORD_REGEX = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

export function validatePassword(password: string): string | null {
  if (password.length < 8) return "パスワードは8文字以上必要です";
  if (!PASSWORD_REGEX.test(password)) return "パスワードは英字と数字を含む必要があります";
  return null;
}

export function generateAccessToken(userId: string, role: UserRole): string {
  return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function verifyAccessToken(token: string): { userId: string; role: UserRole } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string; role: UserRole };
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
