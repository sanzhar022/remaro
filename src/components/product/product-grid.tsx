import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

export interface ProductGridProps {
  products: readonly Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
