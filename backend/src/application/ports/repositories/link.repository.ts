import type { InternalLink } from "../../../domain/models/link.js";

export interface LinkRepository {
  findAll(category?: string): Promise<InternalLink[]>;
  getCategories(): Promise<string[]>;
  create(data: InternalLink): Promise<InternalLink>;
  update(id: string, data: Partial<InternalLink>): Promise<InternalLink | null>;
  delete(id: string): Promise<boolean>;
}
