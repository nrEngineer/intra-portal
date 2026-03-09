export interface CreateLinkInputDTO {
  title: string;
  url: string;
  description?: string;
  category: string;
  sortOrder?: number;
  userId: string;
}

export interface UpdateLinkInputDTO {
  title: string;
  url: string;
  description?: string;
  category: string;
}
