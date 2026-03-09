import type { UserRecord, UserProfile } from "../../../domain/models/user.js";

export interface UserRepository {
  findByEmail(email: string): Promise<UserRecord | null>;
  findById(id: string): Promise<UserRecord | null>;
  create(data: {
    id: string;
    email: string;
    name: string;
    passwordHash: string;
    role: string;
    createdAt: string;
    updatedAt: string;
  }): Promise<UserRecord>;
  updateFailedAttempts(id: string, failedAttempts: number, lockedUntil: string | null): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
  updateName(id: string, name: string): Promise<UserProfile | null>;
  updateRole(id: string, role: string): Promise<UserProfile | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<UserProfile[]>;
}
