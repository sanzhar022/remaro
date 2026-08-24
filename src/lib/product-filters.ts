import type { ProductFilters, ProductSearchParams, ProductSort } from "@/types/product-filters";
import type { Product } from "@/types/product";

const sortValues: readonly ProductSort[] = ["popular", "price-asc", "price-desc", "rating", "newest"];

const normalizeText = (value: string) => value.trim().toLocaleLowerCase("ru");

const parseNonNegativeNumber = (value: string | string[] | undefined): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw?.trim()) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

export function parseProductFilters(params: ProductSearchParams): ProductFilters {
  const rawBrands = params.brand;
  const brands = (Array.isArray(rawBrands) ? rawBrands : rawBrands ? [rawBrands] : [])
    .map((brand) => brand.trim())
    .filter(Boolean);
  const rawSearch = Array.isArray(params.search) ? params.search[0] : params.search;
  const rawSort = Array.isArray(params.sort) ? params.sort[0] : params.sort;
  const rawStock = Array.isArray(params.inStock) ? params.inStock[0] : params.inStock;
  const minPrice = parseNonNegativeNumber(params.minPrice);
  const maxPrice = parseNonNegativeNumber(params.maxPrice);
  const minRating = parseNonNegativeNumber(params.rating);

  return {
    search: rawSearch?.trim() || undefined,
    brands: brands.length > 0 ? [...new Set(brands)] : undefined,
    minPrice,
    maxPrice,
    inStock: rawStock === "true" || undefined,
    minRating: minRating !== undefined && minRating <= 5 ? minRating : undefined,
    sort: sortValues.includes(rawSort as ProductSort) ? rawSort as ProductSort : "popular",
  };
}

export function filterProducts(productList: readonly Product[], filters: ProductFilters): Product[] {
  const search = filters.search ? normalizeText(filters.search) : undefined;
  const brands = filters.brands?.map(normalizeText);
  const low = filters.minPrice;
  const high = filters.maxPrice;
  const minPrice = low !== undefined && high !== undefined ? Math.min(low, high) : low;
  const maxPrice = low !== undefined && high !== undefined ? Math.max(low, high) : high;

  return productList.filter((product) => {
    const searchable = [product.name, product.brand, product.sku, product.shortDescription ?? "", product.description ?? ""]
      .join(" ")
      .toLocaleLowerCase("ru");

    if (search && !searchable.includes(search)) return false;
    if (brands?.length && !brands.includes(normalizeText(product.brand))) return false;
    if (minPrice !== undefined && product.price < minPrice) return false;
    if (maxPrice !== undefined && product.price > maxPrice) return false;
    if (filters.inStock && product.stock <= 0) return false;
    if (filters.minRating !== undefined && product.rating < filters.minRating) return false;
    return true;
  });
}

export function sortProducts(productList: readonly Product[], sort: ProductSort = "popular"): Product[] {
  const sorted = [...productList];

  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  if (sort === "rating") return sorted.sort((a, b) => b.rating - a.rating);
  if (sort === "newest") return sorted.sort((a, b) => Number(Boolean(b.isNew)) - Number(Boolean(a.isNew)));
  return sorted.sort((a, b) => Number(Boolean(b.isPopular)) - Number(Boolean(a.isPopular)));
}

export function getAvailableBrands(productList: readonly Product[]): string[] {
  return [...new Set(productList.map((product) => product.brand))].sort((a, b) => a.localeCompare(b, "ru"));
}

export function getPriceRange(productList: readonly Product[]): { min: number; max: number } {
  if (productList.length === 0) return { min: 0, max: 0 };
  return {
    min: Math.min(...productList.map((product) => product.price)),
    max: Math.max(...productList.map((product) => product.price)),
  };
}
