export interface PasswordResetEntry {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  usedAt: string | null;
  createdAt: string;
}

export interface PasswordResetRepository {
  create(data: Omit<PasswordResetEntry, "usedAt">): Promise<void>;
  findByToken(token: string): Promise<PasswordResetEntry | null>;
  delete(id: string): Promise<void>;
}
