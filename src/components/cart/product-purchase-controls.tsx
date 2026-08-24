"use client";

import { useState } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { QuantityControl } from "@/components/cart/quantity-control";
import type { Product } from "@/types/product";

export function ProductPurchaseControls({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const isUnavailable = product.stock <= 0;

  return (
    <div className="mt-6">
      <p className="type-small mb-2 font-semibold text-foreground">Количество</p>
      <QuantityControl
        quantity={quantity}
        onDecrease={() => setQuantity((current) => Math.max(1, current - 1))}
        onIncrease={() => setQuantity((current) => Math.min(product.stock, current + 1))}
        decreaseDisabled={isUnavailable || quantity <= 1}
        increaseDisabled={isUnavailable || quantity >= product.stock}
      />
      <AddToCartButton product={product} quantity={quantity} size="lg" className="mt-7 w-full" />
    </div>
  );
}
