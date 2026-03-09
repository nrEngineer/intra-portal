export type UserRole = "admin" | "editor" | "member";
export const VALID_ROLES: UserRole[] = ["admin", "editor", "member"];

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

export interface UserRecord {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  role: string;
  failedAttempts: number;
  lockedUntil: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}
