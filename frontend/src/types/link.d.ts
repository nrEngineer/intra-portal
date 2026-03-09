export interface InternalLink {
  id: number;
  title: string;
  url: string;
  description: string;
  category: string;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

export interface LinkFilters {
  category?: string;
}

export interface CreateLinkRequest {
  title: string;
  url: string;
  description?: string;
  category: string;
}

export interface UpdateLinkRequest extends Partial<CreateLinkRequest> {}
