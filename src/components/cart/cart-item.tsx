"use client";

import { ImageIcon, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { QuantityControl } from "@/components/cart/quantity-control";
import { IconButton } from "@/components/ui/icon-button";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/store/cart-store";
import type { CartItem as CartItemType } from "@/types/cart";

export function CartItem({ item }: { item: CartItemType }) {
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const { product, quantity } = item;
  const image = product.images[0];

  return (
    <article className="grid min-w-0 gap-4 rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow-sm)] sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:p-5">
      <Link href={`/product/${product.slug}`} className="grid aspect-square w-full max-w-28 place-items-center overflow-hidden rounded-[var(--radius-md)] bg-[#f1f4f1] text-primary/45 sm:w-28" aria-label={`Открыть товар: ${product.name}`}>
        {image ? <Image src={image} alt={product.name} width={112} height={112} className="size-full object-contain p-2" /> : <ImageIcon size={36} strokeWidth={1.3} aria-hidden="true" />}
      </Link>

      <div className="min-w-0">
        <p className="type-small text-muted">{product.brand} · Артикул {product.sku}</p>
        <Link href={`/product/${product.slug}`} className="mt-1 line-clamp-2 font-bold leading-6 hover:text-primary">{product.name}</Link>
        <p className="type-small mt-2 text-muted">{formatPrice(product.price)} / {product.unit}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <QuantityControl
            quantity={quantity}
            onDecrease={() => decreaseQuantity(product.id)}
            onIncrease={() => increaseQuantity(product.id)}
            decreaseDisabled={quantity <= 1}
            increaseDisabled={quantity >= product.stock}
            label={`Количество товара ${product.name}`}
          />
          <span className="type-small text-muted">Максимум: {product.stock}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-border pt-4 sm:h-full sm:min-w-36 sm:flex-col sm:items-end sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
        <div className="sm:text-right">
          <p className="type-price text-xl">{formatPrice(product.price * quantity)}</p>
          <p className="type-small mt-1 text-muted">{formatPrice(product.price)} × {quantity}</p>
        </div>
        <IconButton aria-label="Удалить товар из корзины" title="Удалить товар" size="sm" className="text-destructive hover:bg-[#fde8e8] hover:text-destructive" onClick={() => removeItem(product.id)}>
          <Trash2 size={18} aria-hidden="true" />
        </IconButton>
      </div>
    </article>
  );
}
