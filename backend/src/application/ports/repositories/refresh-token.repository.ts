export interface RefreshTokenEntry {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface RefreshTokenRepository {
  create(data: RefreshTokenEntry): Promise<void>;
  findByToken(token: string): Promise<RefreshTokenEntry | null>;
  deleteByToken(token: string): Promise<void>;
}
