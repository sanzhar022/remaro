"use client";

import { ShoppingCart } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import type { Product } from "@/types/product";

export interface AddToCartButtonProps extends Omit<ButtonProps, "onClick" | "disabled"> {
  product: Product;
  quantity?: number;
}

export function AddToCartButton({ product, quantity = 1, children, ...props }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);

  return (
    <Button
      disabled={product.stock <= 0}
      onClick={() => addItem(product, quantity)}
      aria-label={`Добавить в корзину: ${product.name}`}
      {...props}
    >
      <ShoppingCart size={18} aria-hidden="true" />
      {children ?? "В корзину"}
    </Button>
  );
}
