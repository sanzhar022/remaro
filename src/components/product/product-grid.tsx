import { ProductCard } from "@/components/product/product-card";
import type { Product } from "@/types/product";

export interface ProductGridProps {
  products: readonly Product[];
  dense?: boolean;
}

export function ProductGrid({ products, dense = false }: ProductGridProps) {
  return (
    <div className={`grid min-w-0 grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-3 ${dense ? "xl:grid-cols-5" : "xl:grid-cols-4"}`}>
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
