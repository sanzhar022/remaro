"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { QuantityControl } from "@/components/cart/quantity-control";
import type { Product } from "@/types/product";

export function ProductPurchaseControls({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const isUnavailable = product.stock <= 0;

  return (
    <div className="mt-6">
      <p className="type-small mb-2 font-semibold text-foreground">Количество</p>
      <QuantityControl
        quantity={quantity}
        onDecrease={() => { setAdded(false); setQuantity((current) => Math.max(1, current - 1)); }}
        onIncrease={() => { setAdded(false); setQuantity((current) => Math.min(product.stock, current + 1)); }}
        decreaseDisabled={isUnavailable || quantity <= 1}
        increaseDisabled={isUnavailable || quantity >= product.stock}
      />
      <AddToCartButton product={product} quantity={quantity} onAdded={() => setAdded(true)} size="lg" className="mt-7 w-full" />
      <p aria-live="polite" className={`type-small mt-2 min-h-5 text-center font-semibold text-success ${added ? "visible" : "invisible"}`}>Добавлено в корзину</p>
    </div>
  );
}
