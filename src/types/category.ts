export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string | null;
  image?: string;
  icon?: string;
  order: number;
  featured?: boolean;
}
