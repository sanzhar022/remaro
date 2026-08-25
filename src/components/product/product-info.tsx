import { ProductPurchaseControls } from "@/components/cart/product-purchase-controls";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  const isAvailable = product.stock > 0;
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined;

  return (
    <div className="flex min-w-0 flex-col rounded-[var(--radius-xl)] border border-border bg-surface p-5 shadow-[var(--shadow-sm)] sm:p-8 lg:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold text-primary">{product.brand}</p>
          <p className="type-small mt-1 text-muted">Артикул: {product.sku}</p>
        </div>
        <FavoriteButton productId={product.id} size="md" className="border border-border" />
      </div>

      <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{product.name}</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {product.isHit && <Badge>Хит</Badge>}
        {product.isNew && <Badge variant="new">Новинка</Badge>}
        {discount !== undefined && discount > 0 && <Badge variant="discount">-{discount}%</Badge>}
      </div>

      <div className="mt-7 border-y border-border py-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-bold tracking-tight text-[var(--navy-900)] sm:text-4xl">{formatPrice(product.price)}</span>
          <span className="text-muted">за {product.unit}</span>
          {product.oldPrice && <span className="type-old-price w-full text-base">{formatPrice(product.oldPrice)}</span>}
        </div>
      </div>

      <div className="mt-6">
        <p className={`font-bold ${isAvailable ? "text-success" : "text-destructive"}`}>{isAvailable ? "В наличии" : "Нет в наличии"}</p>
        {isAvailable && <p className="type-small mt-1 text-muted">Осталось: {product.stock} шт.</p>}
      </div>

      <ProductPurchaseControls product={product} />
    </div>
  );
}
