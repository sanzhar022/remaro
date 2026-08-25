import { ImageIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types/product";

export interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discount = product.oldPrice
    ? Math.round((1 - product.price / product.oldPrice) * 100)
    : undefined;
  const isAvailable = product.stock > 0;

  return (
    <article className="group flex min-w-0 flex-col overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow-sm)] transition duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[var(--shadow-md)]">
      <div className="relative">
        <Link href={`/product/${product.slug}`} aria-label={`Открыть товар: ${product.name}`} className="block focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-primary/25">
          <div className="relative grid aspect-square place-items-center bg-[#f3f4f6] text-[var(--navy-900)]/35">
            {product.images[0] ? (
              <Image src={product.images[0]} alt={product.name} fill sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw" className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]" />
            ) : (
              <ImageIcon className="size-14 transition-transform duration-200 group-hover:scale-105" strokeWidth={1.35} aria-hidden="true" />
            )}
          </div>
        </Link>
        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4rem)] flex-wrap gap-1.5">
          {discount !== undefined && discount > 0 && <Badge variant="discount">-{discount}%</Badge>}
          {product.isNew && <Badge variant="new">Новинка</Badge>}
          {product.isHit && <Badge>Хит</Badge>}
        </div>
        <FavoriteButton productId={product.id} className="absolute right-3 top-3 shadow-[var(--shadow-sm)]" />
      </div>

      <div className="flex flex-1 flex-col p-3.5 sm:p-5">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted sm:text-xs">{product.brand}</p>
        <Link href={`/product/${product.slug}`} className="line-clamp-2 min-h-[2.7rem] text-sm font-semibold leading-5 transition-colors hover:text-[var(--navy-800)] sm:min-h-[3.05rem] sm:text-base sm:leading-6">
          {product.name}
        </Link>

        <div className="mt-auto pt-5">
          <p className={`mb-2 text-xs font-semibold ${isAvailable ? "text-success" : "text-destructive"}`}>{isAvailable ? "В наличии" : "Нет в наличии"}</p>
          <div className="flex min-h-12 flex-wrap items-baseline gap-x-2">
            <span className="type-price">{formatPrice(product.price)}</span>
            <span className="type-small text-muted">/ {product.unit}</span>
            {product.oldPrice && <span className="type-old-price w-full text-sm">{formatPrice(product.oldPrice)}</span>}
          </div>
          <AddToCartButton product={product} className="mt-2 w-full" />
        </div>
      </div>
    </article>
  );
}
