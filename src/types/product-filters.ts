export type ProductSort = "popular" | "price-asc" | "price-desc" | "rating" | "newest";

export interface ProductFilters {
  search?: string;
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  minRating?: number;
  sort?: ProductSort;
}

export type ProductSearchParams = Record<string, string | string[] | undefined>;
