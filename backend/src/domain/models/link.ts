export type LinkCategory = string;

export interface InternalLink {
  id: string;
  title: string;
  url: string;
  description: string;
  category: LinkCategory;
  sortOrder: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
