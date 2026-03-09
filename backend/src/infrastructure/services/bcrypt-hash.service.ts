import bcryptjs from "bcryptjs";
import type { HashService } from "../../application/ports/services/hash.service.js";

export class BcryptHashService implements HashService {
  async hash(password: string): Promise<string> {
    return bcryptjs.hash(password, 10);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(password, hash);
  }
}
