export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  shortDescription?: string;
  description?: string;
  categoryId: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock: number;
  unit: string;
  images: string[];
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isNew?: boolean;
  isHit?: boolean;
  specifications: ProductSpecification[];
}
